export declare class MinioManager {
    private client;
    constructor();
    listBucketsWithStatus(): Promise<{
        name: string;
        creationDate: Date;
        isPublic: boolean;
    }[]>;
    createBucket(bucketName: string): Promise<boolean>;
    setBucketVisibility(bucketName: string, makePublic: boolean): Promise<void>;
}
export declare const minioManager: MinioManager;
//# sourceMappingURL=minioClient.d.ts.map