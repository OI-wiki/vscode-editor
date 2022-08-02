export default (fn,delay: number) => {
    let  timer:NodeJS.Timeout | null = null;
    return (...args) => {
        const context = this;
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn.bind(context,...args),delay);
    }
}