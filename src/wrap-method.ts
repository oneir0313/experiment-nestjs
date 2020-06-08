import { isFunction } from 'util';
import { defaults } from 'lodash';

export interface WrapperMethodContext {
    target: any;
    propertyKey: string;
    descriptor: PropertyDescriptor;
    methodArgs: any[];
    methodOriginal: any;
    methodThis: any;
    result?: any;
    error?: any;
}

export interface IWrapperMethodLifeCycle {
    /**
     * 執行Method前處理
     */
    beforeInvoke?: (context: WrapperMethodContext) => void;

    /**
     * 執行Method
     * @default 提供預設值 context => context.methodOriginal.apply(context.methodThis, context.methodArgs))
     */
    invoke?: (context: WrapperMethodContext) => any;

    /**
     * 當需要修改回傳值時使用
     * 執行Method成功後處理 result
     * @return 覆蓋原本的回傳值
     */
    thenSuccess?: (context: Omit<WrapperMethodContext, 'error'> & Required<Pick<WrapperMethodContext, 'result'>>) => any;

    /**
     * 當需要處理錯誤時使用
     * 替換錯誤類型時 需要實作函示並手動throw例外
     * 當發生錯誤回傳預設值result 需要實作函示並return特定值
     * @return 回傳值
     */
    catchError?: (context: Omit<WrapperMethodContext, 'result'> & Required<Pick<WrapperMethodContext, 'error'>>) => any;

    /**
     * 執行Method後處理
     */
    afterInvoke?: (context: WrapperMethodContext, isSuccess: boolean) => void;
}

/**
 * @example
    export function ExchangeError(): MethodDecorator {
        // static region 靜態區域 只會執行一次

        return WrapperMethod(() => {
            // dynamic region 每次call method都會執行

            return {
                beforeInvoke:()=>{

                }
            };
        });
    }
 * 
 */
export function WrapperMethod<TContext>(createOpt: () => IWrapperMethodLifeCycle): MethodDecorator {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const methodOriginal = descriptor.value;
        descriptor.value = function(...methodArgs: any[]) {
            const methodThis: any = this; // eslint-disable-line @typescript-eslint/no-this-alias
            const opt = defaults(createOpt(), {
                invoke: context => context.methodOriginal.apply(context.methodThis, context.methodArgs),
            } as IWrapperMethodLifeCycle);
            const context: WrapperMethodContext = {
                target,
                propertyKey,
                descriptor,
                methodArgs,
                methodOriginal,
                methodThis,
            };
            try {
                opt.beforeInvoke?.(context);
                const result = opt.invoke?.(context);
                // is Promise like
                if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                    return result
                        .catch((error: any) => {
                            try {
                                context.error = error;
                                if (!isFunction(opt.catchError)) {
                                    throw error;
                                }
                                return opt.catchError?.(context as any);
                            } finally {
                                opt.afterInvoke?.(context, false);
                            }
                        })
                        ?.then((result: any) => {
                            try {
                                context.result = result;
                                const re = opt.thenSuccess?.(context as any) ?? result;
                                context.result = re;
                                return re;
                            } finally {
                                opt.afterInvoke?.(context, true);
                            }
                        });
                }
                try {
                    context.result = result;
                    const re = opt.thenSuccess?.(context as any) ?? result;
                    context.result = re;
                    return re;
                } finally {
                    opt.afterInvoke?.(context, true);
                }
            } catch (error) {
                try {
                    context.error = error;
                    if (!isFunction(opt.catchError)) {
                        throw error;
                    }
                    return opt.catchError?.(context as any);
                } finally {
                    opt.afterInvoke?.(context, false);
                }
            }
        };
        return descriptor;
    };
}
