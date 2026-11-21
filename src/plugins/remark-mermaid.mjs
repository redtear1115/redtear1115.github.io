export default function remarkMermaid() {
  return function transform(tree) {
    walk(tree);
  };
}

function walk(node) {
  if (!node.children) return;

  node.children = node.children.map((child) => {
    if (child.type === 'code' && child.lang === 'mermaid') {
      const source = child.value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      return {
        type: 'html',
        value: `<div class="mermaid-block" data-mermaid><pre class="mermaid-src"><code>${source}</code></pre></div>`,
      };
    }

    walk(child);
    return child;
  });
}
