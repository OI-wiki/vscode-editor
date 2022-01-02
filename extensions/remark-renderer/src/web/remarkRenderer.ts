import { unified } from 'unified';
import remarkDirective from "remark-directive";
import remarkDetails from "remark-details";
import rehypeStringify from 'rehype-stringify/lib';
import remarkGfm from 'remark-gfm';

function getPipeline() {
    return unified()
        .use(remarkDirective)
        .use(remarkDetails)
        .use(remarkGfm)
        .use(rehypeStringify);
}

export function renderHtml(text: string): string {
    return getPipeline().processSync(text).toString();
}