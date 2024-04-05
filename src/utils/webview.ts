export default function generateUsageGuideHTML(configFile: any) {
  const sections = Object.keys(configFile);
  const sectionList = sections
    .map(
      (section) => `
        <h4>${section}</h4>
        <ul>
          ${generateSectionList(configFile[section])}
        </ul>
      `
    )
    .join("");

  return `
      <div>
        ${sectionList}
      </div>
    `;
}

function generateSectionList(section: any) {
  return section
    .map(
      (config: any) => `
        <li>
          <strong>${config.tab || config.name}: </strong> 
          ${config.description || ""}
          <code>${generateCommandList(config.commands)}</code>
        </li>
      `
    )
    .join("");
}

function generateCommandList(commands: any) {
  return commands.map((command: any) => command).join("; ");
}
