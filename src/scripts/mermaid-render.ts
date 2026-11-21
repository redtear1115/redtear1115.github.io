import diagramStyles from './mermaid-render.css?inline';

async function renderMermaidBlocks() {
  const blocks = document.querySelectorAll('.mermaid-block[data-mermaid]');
  if (!blocks.length) return;

  try {
    // Keep the styles in this chunk so Astro does not hoist them into every post.
    const stylesheet = document.createElement('style');
    stylesheet.textContent = diagramStyles;
    document.head.append(stylesheet);

    const { default: mermaid } = await import('mermaid');
    const styles = getComputedStyle(document.documentElement);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    const text = token('--text');
    const surface = token('--surface');
    const diagramConfig = { useMaxWidth: false };

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: {
        darkMode: true,
        background: token('--bg'),
        primaryColor: surface,
        primaryTextColor: text,
        primaryBorderColor: token('--accent'),
        lineColor: token('--text-muted'),
        secondaryColor: token('--border'),
        tertiaryColor: token('--bg'),
        textColor: text,
        noteBkgColor: surface,
        noteTextColor: text,
        noteBorderColor: token('--accent-hover'),
      },
      fontFamily: getComputedStyle(document.body).fontFamily,
      flowchart: diagramConfig,
      swimlane: diagramConfig,
      agentflow: diagramConfig,
      sequence: diagramConfig,
      gantt: diagramConfig,
      journey: diagramConfig,
      timeline: diagramConfig,
      class: diagramConfig,
      state: diagramConfig,
      er: diagramConfig,
      pie: diagramConfig,
      quadrantChart: diagramConfig,
      xyChart: diagramConfig,
      requirement: diagramConfig,
      architecture: diagramConfig,
      mindmap: diagramConfig,
      ishikawa: diagramConfig,
      kanban: diagramConfig,
      gitGraph: diagramConfig,
      c4: diagramConfig,
      sankey: diagramConfig,
      packet: diagramConfig,
      block: diagramConfig,
      eventmodeling: diagramConfig,
      treeView: diagramConfig,
      radar: diagramConfig,
      usecase: diagramConfig,
      venn: diagramConfig,
      cynefin: diagramConfig,
      railroad: diagramConfig,
      suppressErrorRendering: true,
    });

    for (const [index, block] of blocks.entries()) {
      const id = `mermaid-${index}`;
      const source = block.querySelector('pre.mermaid-src code')?.textContent ?? '';

      try {
        const { svg } = await mermaid.render(id, source);
        const figure = document.createElement('div');
        figure.className = 'mermaid-figure';
        figure.setAttribute('role', 'region');
        figure.tabIndex = 0;
        figure.setAttribute('aria-label', '圖表');
        figure.innerHTML = svg;
        block.replaceChildren(figure);
        block.classList.add('is-rendered');
      } catch (error) {
        block.classList.add('has-error');
        const note = document.createElement('p');
        note.className = 'mermaid-error';
        note.setAttribute('role', 'note');
        note.textContent = '圖表語法錯誤，以下顯示原始碼。';
        block.prepend(note);
        document.body.querySelector(`#d${id}`)?.remove();
        document.body.querySelector(`#${id}`)?.remove();
        console.warn('Mermaid diagram failed to render.', error);
      }
    }
  } catch (error) {
    console.warn('Mermaid could not be initialized.', error);
  }
}

void renderMermaidBlocks();
