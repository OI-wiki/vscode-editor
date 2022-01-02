import { unified } from 'unified';
import remarkDirective from "remark-directive";
import remarkDetails from "remark-details";
import rehypeStringify from 'rehype-stringify/lib';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import remarkParse from 'remark-parse';

export function getPipeline() {
    return unified()
        .use(remarkParse)
        .use(remarkDirective)
        .use(remarkDetails)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeStringify);
}
