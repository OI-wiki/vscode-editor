// preview controller
const throttle = require('lodash.throttle');
// @ts-ignore
const vscode = acquireVsCodeApi();
import delayThrottle from '../utils/delayThrottle';
interface CodeLineElement{
    element:HTMLElement,
    line:number
}
class PreviewController {
    
    public cachedElements:CodeLineElement[] = [];

    public codeLineClass = 'code-line';
    public isFromEditor: boolean = false;
    // private currentOffset = 0;

    constructor(){
        this.getCodeLineElements();
        this.initListener();
    }
    private setIsFromEditor = delayThrottle(()=>{
        this.isFromEditor = false;
    },100);
    public initListener(){
        window.addEventListener('message',(e)=>{
            switch (e.data.command){
                case 'changeTextEditorSelection':
                    this.isFromEditor = true;
                    this.scrollToRevealSourceLine(e.data.line);
                    this.setIsFromEditor();
                    return;
                
            }
        });
        window.addEventListener('scroll',() => {
            window.requestAnimationFrame(() =>{
                if(this.isFromEditor) return;
                const line = this.getEditorLineNumberForPageOffset(window.scrollY);
                vscode.postMessage({
                    command:'revealLine',
                    line
                });
            });
        });
    }
    
    public getCodeLineElements(){
    for(const element of Array.from(document.getElementsByClassName(this.codeLineClass))){
        const line = parseInt(element.getAttribute('data-line') as string);
        if(isNaN(line)){
        continue;
        }
        if (element.tagName === 'CODE' && element.parentElement && element.parentElement.tagName === 'PRE') {
        // Fenched code blocks are a special case since the `code-line` can only be marked on
        // the `<code>` element and not the parent `<pre>` element.
            this.cachedElements.push({ element: element.parentElement as HTMLElement, line });
        } else {
            this.cachedElements.push({ element: element as HTMLElement, line });
        }
    }
    }


    public getElementsForSourceLine(targetLine: number): { previous: CodeLineElement; next?: CodeLineElement } {
        const lineNumber = Math.floor(targetLine);
        const lines = this.cachedElements;
        let previous = lines[0] || null;
        for (const entry of lines) {
            if (entry.line === lineNumber) {
            return { previous: entry, next: undefined };
            } else if (entry.line > lineNumber) {
            return { previous, next: entry };
            }
            previous = entry;
        }
        return { previous };
    }

    /**
     * Find the html elements that are at a specific pixel offset on the page.
     */
    public getLineElementsAtPageOffset(offset: number): { previous: CodeLineElement; next?: CodeLineElement } {
        const lines = this.cachedElements;
        const position = offset - window.scrollY;
        let lo = -1;
        let hi = lines.length - 1;
        // binary search
        while (lo + 1 < hi) {
            const mid = Math.floor((lo + hi) / 2);
            const bounds = this.getElementBounds(lines[mid]);
            if (bounds.top + bounds.height >= position) {
            hi = mid;
            }
            else {
            lo = mid;
            }
        }
        const hiElement = lines[hi];
        const hiBounds = this.getElementBounds(hiElement);
        if (hi >= 1 && hiBounds.top > position) {
            const loElement = lines[lo];
            return { previous: loElement, next: hiElement };
        }
        if (hi > 1 && hi < lines.length && hiBounds.top + hiBounds.height > position) {
            return { previous: hiElement, next: lines[hi + 1] };
        }
        return { previous: hiElement };
    }


    public getElementBounds({ element }: CodeLineElement): { top: number; height: number } {
        const myBounds = element.getBoundingClientRect();
        
        // Some code line elements may contain other code line elements.
        // In those cases, only take the height up to that child.
        const codeLineChild = element.querySelector(`.${this.codeLineClass}`);
        if (codeLineChild) {
            const childBounds = codeLineChild.getBoundingClientRect();
            const height = Math.max(1, (childBounds.top - myBounds.top));
            return {
            top: myBounds.top,
            height: height
            };
        }
        
        return myBounds;
    }


    public scrollToRevealSourceLine(line: number) {
        
        if (line <= 0) {
            window.scroll(window.scrollX, 0);
            return;
        }
        
        const { previous, next } = this.getElementsForSourceLine(line);
        if (!previous) {
            return;
        }
        let scrollTo = 0;
        const rect = this.getElementBounds(previous);
        const previousTop = rect.top;
        if (next && next.line !== previous.line) {
            // Between two elements. Go to percentage offset between them.
            const betweenProgress = (line - previous.line) / (next.line - previous.line);
            const elementOffset = next.element.getBoundingClientRect().top - previousTop;
            scrollTo = previousTop + betweenProgress * elementOffset;
        } else {
            const progressInElement = line - Math.floor(line);
            scrollTo = previousTop + (rect.height * progressInElement);
        }
        scrollTo = Math.abs(scrollTo) < 1 ? Math.sign(scrollTo) : scrollTo;
        const offset = Math.max(1,window.scrollY + scrollTo);
        // console.log(offset);
        
        // if(offset === this.currentOffset) return;
        window.scroll(window.scrollX, offset);
        // this.currentOffset = offset;
    }


    public  getEditorLineNumberForPageOffset(offset: number) {
        const { previous, next } = this.getLineElementsAtPageOffset(offset);
        if (previous) {
            const previousBounds = this.getElementBounds(previous);
            const offsetFromPrevious = (offset - window.scrollY - previousBounds.top);
            if (next) {
                const progressBetweenElements = offsetFromPrevious / (this.getElementBounds(next).top - previousBounds.top);
                const line = previous.line + progressBetweenElements * (next.line - previous.line);
                return line;
            } else {
                const progressWithinElement = offsetFromPrevious / (previousBounds.height);
                const line = previous.line + progressWithinElement;
                return line;
            }
        }
        return null;
    }
    // public getLineElementForFragment(fragment: string): CodeLineElement | undefined {
    // return this.cachedElements.find((element) => {
    //     return element.element.id === fragment;
    // });
    // }
    /* End of PreviewController class */
}

function onLoad() {
    /* tslint:disable-next-line:no-unused-expression */
    new PreviewController();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onLoad);
} else {
    onLoad();
}
