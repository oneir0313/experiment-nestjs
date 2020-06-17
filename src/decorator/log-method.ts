import { Logger } from '@nestjs/common';
import { WrapperMethod } from './wrap-method';
import { defaultsDeep } from 'lodash';

export interface ILogMethodOpt {
    logger?: Logger;
    message?: string;
    error?:
        | false
        | {
              level?: keyof Pick<Logger, 'error' | 'log' | 'warn' | 'debug' | 'verbose'>;
              includeDetail?: boolean;
              includeStack: boolean;
              convertArgs?: (arg: any) => string;
          };
    success?:
        | false
        | {
              level?: keyof Pick<Logger, 'error' | 'log' | 'warn' | 'debug' | 'verbose'>;
              includeDetail?: boolean;
              convertArgs?: (arg: any) => string;
              convertResult?: (arg: any) => string;
          };
}

export function LogMethod(inOpt?: ILogMethodOpt): MethodDecorator {
    // static value
    const opt: ILogMethodOpt = defaultsDeep(inOpt, {
        logger: new Logger(`LogMethod`),
        error: {
            level: 'error',
            includeDetail: false,
            includeStack: false,
            convertArgs: JSON.stringify,
        },
        success: {
            level: 'log',
            includeDetail: false,
            convertArgs: JSON.stringify,
            convertResult: JSON.stringify,
        },
    } as ILogMethodOpt);

    return WrapperMethod(() => {
        let startTime: number;
        let targetName: string;
        return {
            beforeInvoke: ctx => {
                startTime = Date.now();
                targetName = ctx.target?.constructor?.name ?? 'Unknow';
            },
            afterInvoke: (ctx, isSuccess) => {
                try {
                    const baseStr = `[${(Date.now() - startTime) / 1000}s] ${opt?.message ? opt?.message + ' ' : ''}${targetName}.${
                        ctx.propertyKey
                    } `;
                    // success
                    if (isSuccess && opt?.success !== false) {
                        const detailStr = opt?.success?.includeDetail
                            ? `(${opt?.success?.convertArgs?.(ctx.methodArgs)}) => (${opt?.success?.convertResult?.(ctx.result)}) `
                            : '';
                        opt?.logger?.[opt?.success?.level ?? 'log'](`${baseStr}${detailStr}`);
                        return;
                    }
                    // error
                    if (!isSuccess && opt?.error !== false) {
                        const detailStr = opt?.error?.includeDetail ? `(${opt?.error?.convertArgs?.(ctx.methodArgs)}) ` : '';
                        let throwStr = 'throw ';
                        if (ctx.error instanceof Error) {
                            if (typeof ctx.error.message === 'string') {
                                throwStr += opt?.error?.includeStack ? ctx.error.stack : ctx.error.message;
                            } else {
                                //Nestjs HttpException.message 可以是 object
                                throwStr += opt?.error?.includeStack
                                    ? JSON.stringify(ctx.error.message) + ' ' + ctx.error.stack
                                    : JSON.stringify(ctx.error.message);
                            }
                        } else {
                            //js 可以 throw int string object....
                            throwStr += `(${typeof ctx.error}) ${JSON.stringify(ctx.error)}`;
                        }
                        opt?.logger?.[opt?.error?.level ?? 'error'](`${baseStr}${detailStr}${throwStr}`);
                        return;
                    }
                } catch (e) {
                    opt?.logger?.['error'](`LogMethod throw error ${e instanceof Error ? e.stack : e}`);
                }
            }, //afterInvoke
        };
    });
}

export function DebugLogMethod(opt?: ILogMethodOpt): MethodDecorator {
    // if(!isDevelop()){ return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor; }

    return LogMethod(
        defaultsDeep(opt, {
            success: {
                level: 'debug',
            },
        } as ILogMethodOpt),
    );
}
