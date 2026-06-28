import { iconMap, lucideSvgs } from "./icons.js";

const buildIconHelperChunk = () => {
  return `
(function() {
  const iconMap = ${JSON.stringify(iconMap)};
  const lucideSvgs = ${JSON.stringify(lucideSvgs)};

  window.getIcon = function(name, extraClasses = "", attrs = "") {
    const lucideName = iconMap[name] || name;
    const svgContent = lucideSvgs[lucideName];
    if (!svgContent) {
      console.warn("Icon not found: " + name);
      return "";
    }
    const attrStr = attrs ? " " + attrs : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-svg icon-' + lucideName + ' ' + extraClasses + '"' + attrStr + '>' + svgContent + '</svg>';
  };

  window.updateIcon = function(elementOrParent, name) {
    if (!elementOrParent) return;
    let svgEl = elementOrParent.tagName.toLowerCase() === "svg" ? elementOrParent : elementOrParent.querySelector("svg");
    if (svgEl) {
      const temp = document.createElement("div");
      temp.innerHTML = window.getIcon(name, svgEl.getAttribute("class") || "");
      const newSvg = temp.firstElementChild;
      if (newSvg) {
        svgEl.replaceWith(newSvg);
      }
    } else {
      elementOrParent.innerHTML = window.getIcon(name);
    }
  };
})();
  `;
};

export const buildClientScript = () => {
  return buildIconHelperChunk();
};
