import {visit} from 'unist-util-visit';


export default function rehypeSourceLine() {
  return (tree:any) => {
    visit(tree, (node) => {
      // add code-line into node
      if (node?.position?.start?.line) {
        if (!node.properties) {node.properties = {};}
        node.properties.class = 'code-line';
        node.properties.dataLine = node.position.start.line;
      }
    });
  };
}