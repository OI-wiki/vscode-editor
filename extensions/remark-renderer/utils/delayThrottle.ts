export default (fn:any,delay: number) => {
    let  timer:any | null = null;
    return (...args:any[]) => {
        const context = this;
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn.bind(context,...args),delay);
    };
};
