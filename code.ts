async function createTimeline(startDate: Date, endDate: Date, startX: number, startY: number) {

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

    const lineHeigt = 1000;
    const textWidth = 360;
    const grayColor = {r: 0.5, g: 0.5, b: 0.5};

    // 週の区切り線（FigJam用のConnector）
    const connector = figma.createConnector();
    
    // 前の週と月が変わった場合に線を太くする
    let isMonthChange = false;
    
    // 最初の週の場合は常に通常の太さ
    if (weekStart.getTime() === adjustedStartDate.getTime()) {
      isMonthChange = false;
    } else {
      // 前の週の開始日を計算
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      
      // 前の週と月が変わったかチェック
      isMonthChange = prevWeekStart.getMonth() !== weekStart.getMonth();
    }
    
    connector.strokeWeight = isMonthChange ? 8 : 4;
    connector.strokes = [{type: 'SOLID', color: grayColor}];
    
    // 開始点と終了点を設定
    const startPoint = {x: xPosition, y: startY};
    const endPoint = {x: xPosition, y: startY + lineHeigt};
    
    // コネクタの位置を設定
    connector.connectorStart = {
      position: startPoint
    };
    connector.connectorEnd = {
      position: endPoint
    };
    
    figma.currentPage.appendChild(connector);
    const line = connector;

            // 週の開始日表示（例：3/3~）を大きいフォントで表示
            const dateText = figma.createText();
            const startMonth = weekStart.getMonth() + 1;
            const startDay = weekStart.getDate();
            dateText.characters = `${startMonth}/${startDay}~`;
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
      const {x, y} = figma.viewport.center;

      const nodes = await createTimeline(startDate, endDate, x, y);

      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
      figma.closePlugin();
    }
  };
}

main();
