function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) walk(child, visit);
}

export default function rehypeImagePerformance() {
  return (tree, file) => {
    const isArticle = String(file?.path ?? '').includes('/articles/');
    let firstArticleImage = true;

    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img') return;
      node.properties ??= {};
      node.properties.decoding = 'async';

      if (isArticle && firstArticleImage) {
        node.properties.fetchPriority = 'high';
        firstArticleImage = false;
        return;
      }

      node.properties.loading = 'lazy';
    });
  };
}
