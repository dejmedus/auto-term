export default function generateUsageGuideHTML(configFile: any) {
  const sections = Object.keys(configFile);
  const defaultActions = ["setup", "open", "close", "start", "stop", "restart"];
  const sectionList = sections
    .map(
      (section) => `
        <h4>Auto Term: ${
          defaultActions.includes(section)
            ? section
            : `action and enter '${section}'`
        }</h4>
        <ul>
          ${generateSectionList(configFile[section])}
        </ul>
      `
    )
    .join("");

  // Wrap everything in a container div
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
          <strong>${config.name} tab</strong> 
          ${config.description ? config.description : ""}
          <code>${generateCommandList(config.commands)}</code>
        </li>
      `
    )
    .join("");
}

function generateCommandList(commands: any) {
  return commands.map((command: any) => command).join("; ");
}
