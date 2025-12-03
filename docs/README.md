# Welcome to NTLx's Blog

This repository serves as a personal knowledge base and blog, covering topics such as Linux configuration, software development, and system administration.

## Contact

Feel free to reach out via email: [lx3325360@outlook.com](mailto:lx3325360@outlook.com)

## Theme Selection

<div class="demo-theme-preview">
  <a data-theme="vue">vue.css</a>
  <a data-theme="buble">buble.css</a>
  <a data-theme="dark">dark.css</a>
  <a data-theme="pure">pure.css</a>
  <a data-theme="dolphin">dolphin.css</a>
</div>

<style>
  .demo-theme-preview a {
    padding-right: 10px;
  }

  .demo-theme-preview a:hover {
    cursor: pointer;
    text-decoration: underline;
  }
</style>

<script>
  const preview = Docsify.dom.find('.demo-theme-preview');
  const themes = Docsify.dom.findAll('[rel="stylesheet"]');

  preview.onclick = function (e) {
    const title = e.target.getAttribute('data-theme');

    themes.forEach(theme => {
      theme.disabled = theme.title !== title;
    });
  };
</script>
