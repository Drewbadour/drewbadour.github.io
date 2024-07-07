import type { PluginContext } from 'rollup';
import { z } from 'zod';
export declare function createImage(pluginContext: PluginContext, shouldEmitFile: boolean, entryFilePath: string): () => z.ZodEffects<z.ZodString, z.ZodNever | {
    ASTRO_ASSET: string;
    format: "jpeg" | "jpg" | "png" | "tiff" | "webp" | "gif" | "svg" | "avif";
    width: number;
    height: number;
    src: string;
    fsPath: string;
    orientation?: number | undefined;
}, string>;
