export const getUpdatedAt = (data: HTMLElement) => {
  const element = data.querySelector(".pageHeaderRight");
  return element?.textContent?.trim().split("\n")[0];
};

export const getTextContent = (data: HTMLElement, query: string) => {
  const element = data.querySelector(query);
  return element?.textContent || "";
};
