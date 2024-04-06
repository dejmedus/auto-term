/**
 * This function generates HTML for a usage guide based on a configuration object.
 * @param configFile - An object containing the configuration for each section of the usage guide. Each key in the object represents a section, and the value is an array of configuration objects for that section.
 * @returns A string of HTML representing the usage guide.
 */
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
