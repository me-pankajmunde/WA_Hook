const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { Artifact } = require('../models');

class GitHubService {
  constructor() {
    this.token = config.github.token;
    this.username = config.github.username;
    this.apiUrl = 'https://api.github.com';
  }

  async createRepository(name, description, isPrivate = false) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/user/repos`,
        {
          name,
          description,
          private: isPrivate,
          auto_init: true
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      logger.info(`Repository created: ${response.data.full_name}`);
      return response.data;
    } catch (error) {
      logger.error('Error creating repository:', error.response?.data || error.message);
      throw error;
    }
  }

  async createFile(repoName, filePath, content, message) {
    try {
      const encodedContent = Buffer.from(content).toString('base64');
      
      const response = await axios.put(
        `${this.apiUrl}/repos/${this.username}/${repoName}/contents/${filePath}`,
        {
          message,
          content: encodedContent
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      logger.info(`File created: ${filePath} in ${repoName}`);
      return response.data;
    } catch (error) {
      logger.error('Error creating file:', error.response?.data || error.message);
      throw error;
    }
  }

  async createMultipleFiles(repoName, files, commitMessage) {
    try {
      // Get the default branch
      const repoResponse = await axios.get(
        `${this.apiUrl}/repos/${this.username}/${repoName}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      const defaultBranch = repoResponse.data.default_branch;

      // Get the latest commit
      const branchResponse = await axios.get(
        `${this.apiUrl}/repos/${this.username}/${repoName}/git/refs/heads/${defaultBranch}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      const latestCommitSha = branchResponse.data.object.sha;

      // Create blobs for each file
      const blobs = await Promise.all(
        files.map(async (file) => {
          const blobResponse = await axios.post(
            `${this.apiUrl}/repos/${this.username}/${repoName}/git/blobs`,
            {
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64'
            },
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json'
              }
            }
          );

          return {
            path: file.path,
            mode: '100644',
            type: 'blob',
            sha: blobResponse.data.sha
          };
        })
      );

      // Create tree
      const treeResponse = await axios.post(
        `${this.apiUrl}/repos/${this.username}/${repoName}/git/trees`,
        {
          base_tree: latestCommitSha,
          tree: blobs
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      // Create commit
      const commitResponse = await axios.post(
        `${this.apiUrl}/repos/${this.username}/${repoName}/git/commits`,
        {
          message: commitMessage,
          tree: treeResponse.data.sha,
          parents: [latestCommitSha]
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      // Update reference
      await axios.patch(
        `${this.apiUrl}/repos/${this.username}/${repoName}/git/refs/heads/${defaultBranch}`,
        {
          sha: commitResponse.data.sha
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      logger.info(`Files committed to ${repoName}`);
      return commitResponse.data;
    } catch (error) {
      logger.error('Error creating multiple files:', error.response?.data || error.message);
      throw error;
    }
  }

  async buildProject(userId, sessionId, projectSpec) {
    try {
      // Generate repository name
      const repoName = `${projectSpec.name || 'project'}-${Date.now()}`;
      
      // Create repository
      const repo = await this.createRepository(
        repoName,
        projectSpec.description || 'Generated by WhatsApp AI Assistant',
        projectSpec.isPrivate || false
      );

      // Create artifact record
      const artifact = await Artifact.create({
        userId,
        sessionId,
        type: 'repository',
        title: repoName,
        description: projectSpec.description,
        url: repo.html_url,
        metadata: {
          repoFullName: repo.full_name,
          repoId: repo.id
        },
        status: 'in_progress'
      });

      // Generate code files (this would use AI code generation)
      const files = projectSpec.files || [
        {
          path: 'README.md',
          content: `# ${repoName}\n\n${projectSpec.description || 'Project generated by AI'}`
        }
      ];

      // Commit files
      await this.createMultipleFiles(repoName, files, 'Initial commit from AI Assistant');

      // Update artifact status
      await artifact.update({ status: 'completed' });

      logger.info(`Project built: ${repo.html_url}`);
      return {
        artifact,
        repository: repo
      };
    } catch (error) {
      logger.error('Error building project:', error);
      throw error;
    }
  }
}

module.exports = new GitHubService();
