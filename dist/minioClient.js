"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.minioManager = exports.MinioManager = void 0;
const Minio = __importStar(require("minio"));
const config_1 = require("./config");
class MinioManager {
    client;
    constructor() {
        this.client = new Minio.Client({
            endPoint: config_1.config.minio.endPoint,
            port: config_1.config.minio.port,
            useSSL: config_1.config.minio.useSSL,
            accessKey: config_1.config.minio.accessKey,
            secretKey: config_1.config.minio.secretKey,
        });
    }
    async listBucketsWithStatus() {
        try {
            const buckets = await this.client.listBuckets();
            const bucketInfos = await Promise.all(buckets.map(async (bucket) => {
                let isPublic = false;
                try {
                    const policyStr = await this.client.getBucketPolicy(bucket.name);
                    if (policyStr) {
                        const policy = JSON.parse(policyStr);
                        // Check simplistic "Read Only" public pattern
                        const hasPublicRead = policy.Statement?.some((stmt) => stmt.Effect === 'Allow' &&
                            stmt.Principal?.AWS?.includes('*') &&
                            stmt.Action?.includes('s3:GetObject'));
                        isPublic = !!hasPublicRead;
                    }
                }
                catch (err) {
                    // If error (e.g. NoSuchBucketPolicy), assume private
                    isPublic = false;
                }
                return {
                    name: bucket.name,
                    creationDate: bucket.creationDate,
                    isPublic
                };
            }));
            return bucketInfos;
        }
        catch (error) {
            console.error('Error listing buckets:', error);
            throw error;
        }
    }
    async createBucket(bucketName) {
        // Check if exists
        const exists = await this.client.bucketExists(bucketName);
        if (exists) {
            throw new Error(`Bucket ${bucketName} already exists.`);
        }
        await this.client.makeBucket(bucketName, 'us-east-1'); // Region is mandatory but often ignored by MinIO default
        return true;
    }
    async setBucketVisibility(bucketName, makePublic) {
        if (makePublic) {
            const policy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${bucketName}/*`]
                    }
                ]
            };
            await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
        }
        else {
            // To make private, we simply remove the policy (or set empty)
            // MinIO client api has setBucketPolicy with empty string usually working to clear, 
            // or we can just send an empty statement policy. 
            // Safest for "Private" is usually clearing it.
            await this.client.setBucketPolicy(bucketName, "");
        }
    }
}
exports.MinioManager = MinioManager;
exports.minioManager = new MinioManager();
//# sourceMappingURL=minioClient.js.map