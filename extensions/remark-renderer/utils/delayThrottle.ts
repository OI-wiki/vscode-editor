export default (fn:any,delay: number) => {
    let  timer:NodeJS.Timeout | null = null;
    return (...args:any[]) => {
        const context = this;
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn.bind(context,...args),delay);
    }
}
