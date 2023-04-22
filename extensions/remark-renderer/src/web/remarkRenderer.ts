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
import remarkLocalImage from './plugin/remark-local-image';
import { WebviewPanel } from 'vscode';

export function getPipeline(webviewPanel: WebviewPanel) {
    return unified()
        .use(remarkParse)
        .use(remarkLocalImage(webviewPanel))
        // .use(remarkMath)
        .use(remarkFrontmatter, ['yaml', 'toml'])
        .use(remarkDirective)
        .use(remarkDetails)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        // .use(rehypeMathjax, {
        //     tex: {
        //         displayMath: ['\[', '\]'],
        //         inlineMath: ['\(', '\)']
        //     }
        // })
        .use(rehypeRaw)
        .use(rehypeSourceLine)
        .use(rehypeStringify, {
            quote:'"'
        });
}
