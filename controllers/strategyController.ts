import express from 'express';
import cron from 'node-cron';
import { executeCustomStrategy } from '../services/tradingStrategiesService';

interface IndicatorConfig {
    name: string;
    options: any;
    thresholds?: {
        upper: number;
        lower: number;
    };
}

type StrategyConfig = {
    baseAsset: string;
    quoteAsset: string;
    quantity: number;
    indicators: IndicatorConfig[];
    historicalData: {
        timeframe: string;
        dataPoints: number;
    };
};

const strategies: Map<string, StrategyConfig> = new Map();
const cronJobs: Map<string, cron.ScheduledTask> = new Map();

export const strategyController = {
    setOrUpdateStrategy: (req: express.Request, res: express.Response) => {
        const strategy: StrategyConfig = req.body;
        if (!strategy.baseAsset) {
            return res.status(400).send('Base asset is required.');
        }

        strategies.set(strategy.baseAsset, strategy);
        strategyController.scheduleStrategy(strategy.baseAsset);

        res.status(201).send(`Strategy for ${strategy.baseAsset} received and applied.`);
    },

    scheduleStrategy: (baseAsset: string) => {
        const strategy = strategies.get(baseAsset);

        if (!strategy) {
            console.error(`Strategy for ${baseAsset} not found when trying to schedule.`);
            return;
        }
        if (cronJobs.has(baseAsset)) {
            const existingJob = cronJobs.get(baseAsset);
            existingJob?.stop();
            cronJobs.delete(baseAsset);
        }

        const job = cron.schedule('*/10 * * * * *', async () => {
            console.log(`Executing strategy for ${baseAsset}`);
            try {
                await executeCustomStrategy(strategy);
                console.log(`Strategy execution for ${baseAsset} completed successfully.`);
            } catch (error) {
                console.error(`Failed to execute strategy for ${baseAsset}:`, error);
            }
        });

        cronJobs.set(baseAsset, job);
        console.log(`Strategy for ${baseAsset} has been scheduled.`);
    },

    executeStrategy: async (req: express.Request, res: express.Response) => {
        const { baseAsset } = req.params;
        const strategy = strategies.get(baseAsset);
        if (strategy) {
            try {
                await executeCustomStrategy(strategy);
                res.send(`Strategy execution for ${baseAsset} completed.`);
            } catch (error) {
                console.error(`Failed to execute strategy for ${baseAsset}:`, error);
                res.status(500).send(`Failed to execute strategy for ${baseAsset}.`);
            }
        } else {
            res.status(404).send(`Strategy for ${baseAsset} not found.`);
        }
    },

    unscheduleStrategy: (baseAsset: string) => {
        if (cronJobs.has(baseAsset)) {
            const job = cronJobs.get(baseAsset);
            job?.stop();
            cronJobs.delete(baseAsset);
            console.log(`Cron job for ${baseAsset} has been unscheduled.`);
        }
    }
};