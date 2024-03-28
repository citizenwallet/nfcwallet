export function extractUserFromInjectedJson(htmlString: string) {
  const parts = htmlString.split("<script>self.__next_f.push");

  for (let i = 1; i < parts.length; i++) {
    let part = parts[i];
    part = part.substring(0, part.lastIndexOf("}") + 1);
    part = part.substring(part.indexOf("{"));
    if (part.length < 25 || part.length > 1000) continue;
    try {
      part = part.replace(/\\"/g, `"`);
      const jsonObject = JSON.parse(part);
      if (jsonObject.user) {
        return jsonObject;
      }
    } catch (e) {
      console.error("Error parsing JSON:", e, `--->${part}<--`);
    }
  }
  return null;
}
