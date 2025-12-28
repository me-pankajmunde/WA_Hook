const Queue = require('bull');
const config = require('../config');
const logger = require('../utils/logger');

// Import services
const ocrService = require('./ocrService');
const githubService = require('./githubService');
const aiService = require('./aiService');

// Create queues
const mediaProcessingQueue = new Queue('media-processing', config.redis.url);
const githubBuildQueue = new Queue('github-build', config.redis.url);
const aiTaskQueue = new Queue('ai-task', config.redis.url);

// Media processing job processor
mediaProcessingQueue.process(async (job) => {
  const { mediaId } = job.data;
  logger.info(`Processing media job: ${job.id}`, { mediaId });
  
  try {
    await ocrService.processMedia(mediaId);
    logger.info(`Media job completed: ${job.id}`);
    return { success: true, mediaId };
  } catch (error) {
    logger.error(`Media job failed: ${job.id}`, error);
    throw error;
  }
});

// GitHub build job processor
githubBuildQueue.process(async (job) => {
  const { userId, sessionId, projectSpec } = job.data;
  logger.info(`Processing GitHub build job: ${job.id}`);
  
  try {
    const result = await githubService.buildProject(userId, sessionId, projectSpec);
    logger.info(`GitHub build job completed: ${job.id}`);
    return { success: true, ...result };
  } catch (error) {
    logger.error(`GitHub build job failed: ${job.id}`, error);
    throw error;
  }
});

// AI task job processor
aiTaskQueue.process(async (job) => {
  const { type, data } = job.data;
  logger.info(`Processing AI task job: ${job.id}`, { type });
  
  try {
    let result;
    
    switch (type) {
      case 'summarize':
        result = await aiService.summarizeConversation(data.messages);
        break;
      case 'extract_intent':
        result = await aiService.extractIntent(data.message);
        break;
      case 'analyze_image':
        result = await aiService.analyzeImage(data.imageUrl, data.prompt);
        break;
      default:
        throw new Error(`Unknown AI task type: ${type}`);
    }
    
    logger.info(`AI task job completed: ${job.id}`);
    return { success: true, result };
  } catch (error) {
    logger.error(`AI task job failed: ${job.id}`, error);
    throw error;
  }
});

// Event handlers
const setupQueueEvents = (queue, queueName) => {
  queue.on('completed', (job, result) => {
    logger.info(`${queueName} job completed`, { jobId: job.id });
  });

  queue.on('failed', (job, err) => {
    logger.error(`${queueName} job failed`, { jobId: job.id, error: err.message });
  });

  queue.on('stalled', (job) => {
    logger.warn(`${queueName} job stalled`, { jobId: job.id });
  });
};

setupQueueEvents(mediaProcessingQueue, 'media-processing');
setupQueueEvents(githubBuildQueue, 'github-build');
setupQueueEvents(aiTaskQueue, 'ai-task');

// Queue service interface
class QueueService {
  async addMediaProcessingJob(mediaId, options = {}) {
    const job = await mediaProcessingQueue.add(
      { mediaId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        ...options
      }
    );
    
    logger.info(`Media processing job added: ${job.id}`);
    return job;
  }

  async addGitHubBuildJob(userId, sessionId, projectSpec, options = {}) {
    const job = await githubBuildQueue.add(
      { userId, sessionId, projectSpec },
      {
        attempts: 2,
        timeout: 300000, // 5 minutes
        ...options
      }
    );
    
    logger.info(`GitHub build job added: ${job.id}`);
    return job;
  }

  async addAITaskJob(type, data, options = {}) {
    const job = await aiTaskQueue.add(
      { type, data },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        ...options
      }
    );
    
    logger.info(`AI task job added: ${job.id}`);
    return job;
  }

  async getJobStatus(queue, jobId) {
    const job = await queue.getJob(jobId);
    if (!job) {
      return null;
    }
    
    const state = await job.getState();
    return {
      id: job.id,
      state,
      progress: job.progress(),
      result: job.returnvalue,
      failedReason: job.failedReason
    };
  }

  async getQueueStats(queue) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed
    };
  }

  getQueues() {
    return {
      mediaProcessing: mediaProcessingQueue,
      githubBuild: githubBuildQueue,
      aiTask: aiTaskQueue
    };
  }
}

module.exports = new QueueService();
