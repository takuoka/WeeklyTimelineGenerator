async function createTimeline(startDate: Date, endDate: Date, startX: number, startY: number, skipWeekends: Boolean) {

  const nodes: SceneNode[] = [];
  let xPosition = startX;

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" })

  // 開始日を月曜日に調整
  const adjustedStartDate = new Date(startDate);
  const startDayOfWeek = adjustedStartDate.getDay();
  if (startDayOfWeek !== 1) { // 1は月曜日
    // 前の週の月曜日に調整
    const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    adjustedStartDate.setDate(adjustedStartDate.getDate() - daysToSubtract);
  }

  // 週ごとに処理
  for (let weekStart = new Date(adjustedStartDate); weekStart <= endDate; weekStart.setDate(weekStart.getDate() + 7)) {
    // 週の終了日を計算
    const weekEnd = new Date(weekStart);
    if (skipWeekends) {
      // 金曜日（週の開始から4日後）
      weekEnd.setDate(weekStart.getDate() + 4);
    } else {
      // 日曜日（週の開始から6日後）
      weekEnd.setDate(weekStart.getDate() + 6);
    }

    // 終了日を超えないように調整
    if (weekEnd > endDate) {
      weekEnd.setTime(endDate.getTime());
    }

    const lineHeigt = 1000;
    const textWidth = 360;
    const grayColor = {r: 0.5, g: 0.5, b: 0.5};

    // 週の区切り線
    const line = figma.createLine();
    line.x = xPosition;
    line.y = startY + lineHeigt;
    line.rotation = 90;
    line.resize(lineHeigt, 0);
    line.strokeWeight = 2;
    line.strokes = [{type: 'SOLID', color: grayColor}];

            // 週の期間表示（例：3/3 - 3/9）を大きいフォントで表示
            const dateText = figma.createText();
            const startMonth = weekStart.getMonth() + 1;
            const startDay = weekStart.getDate();
            const endMonth = weekEnd.getMonth() + 1;
            const endDay = weekEnd.getDate();
            dateText.characters = `${startMonth}/${startDay} - ${endMonth}/${endDay}`;
            dateText.resize(textWidth, 1);
            dateText.x = xPosition;
            dateText.y = startY + 30;
            dateText.fontSize = 40;
            dateText.textAlignHorizontal = 'CENTER';
            dateText.fontName = { family: "Inter", style: "Bold" };
            dateText.fills = [{type: 'SOLID', color: grayColor}];
            figma.currentPage.appendChild(dateText);

            nodes.push(line, dateText);

    xPosition += textWidth;
  }

  return nodes;
}


async function main() {

  figma.showUI(__html__, { width: 240, height: 244 });

  figma.ui.onmessage = async msg => {
    if (msg.type === 'create-timeline') {
      const startDate = new Date(msg.startDate);
      const endDate = new Date(msg.endDate);
      const skipWeekends: Boolean = msg.skipWeekends;
      const {x, y} = figma.viewport.center;

      const nodes = await createTimeline(startDate, endDate, x, y, skipWeekends);

      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
      figma.closePlugin();
    }
  };
}

main();
