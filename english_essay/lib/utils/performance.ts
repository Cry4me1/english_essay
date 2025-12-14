/**
 * 实用工具函数
 */

/**
 * 防抖函数 - 延迟执行，适用于频繁触发的事件
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * 节流函数 - 限制执行频率，适用于滚动等高频事件
 * @param fn 要节流的函数
 * @param limit 时间限制（毫秒）
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * 带取消功能的防抖函数
 */
export function debounceCancellable<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    delay: number
): {
    run: (...args: Parameters<T>) => void;
    cancel: () => void;
} {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    const run = (...args: Parameters<T>) => {
        cancel();
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };

    return { run, cancel };
}
