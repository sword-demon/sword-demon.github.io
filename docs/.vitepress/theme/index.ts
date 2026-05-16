import Teek from "vitepress-theme-teek";
import "vitepress-theme-teek/index.css";
import { initComponent } from "vitepress-plugin-legend/component";
// 导入 CSS
import "vitepress-plugin-legend/dist/index.css";

export default {
  extends: Teek,
  enhanceApp(ctx) {
    initComponent(ctx.app);
  },
};
