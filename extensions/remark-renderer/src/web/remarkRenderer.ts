// @ts-nocheck
import { unified } from 'unified';
import remarkDirective from "remark-directive";
import remarkDetails from "remark-details";
import rehypeStringify from 'rehype-stringify/lib';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeSourceLine from './plugin/rehype-source-line';
import remarkSnippets from './plugin/remark-snippets';

export function getPipeline() {
    return unified()
        .use(remarkParse)
        // .use(remarkSnippets)
        // .use(()=>(tree)=>console.log('next'))
        .use(remarkFrontmatter, ['yaml', 'toml'])
        .use(remarkDirective)
        .use(remarkDetails)
        .use(remarkGfm)
        .use(remarkRehype, {allowDangerousHtml: true})
        .use(rehypeRaw)
        .use(rehypeSourceLine)
        .use(rehypeStringify, {
            quote:'"'
        });
}
