console.log = function(...args){
  Phoenix.log(...args);
};

function getWindowCount(screenId) {
  const screens = Screen.all();
  const windowCount = {};
  for (let screen of screens) {
    if (screen.identifier() != screenId) {
      continue;
    }
    const windows = screen.windows();
    for (let window of windows) {
      const frame = window.frame();
      if (frame.width > 1 && frame.height > 1) {
        const app = window.app();
        const appName = app.bundleIdentifier();
        if (windowCount[appName] === undefined) {
          windowCount[appName] = 1;
        } else {
          windowCount[appName]++;
        }
      }
    }
  }
  return windowCount;
}

function adjustWindow(layout) {
  const screens = Screen.all();
  for (let screen of screens) {
    const layoutWindows = layout[screen.identifier()];
    if (layoutWindows === undefined) {
      continue;
    }
    const windows = screen.windows();
    for (let window of windows) {
      const frame = window.frame();
      if (frame.width < 2 && frame.height < 2) {
        continue;
      }
      const app = window.app();
      const appName = app.bundleIdentifier();
      const frames = layoutWindows[appName];
      if (frames === undefined) {
        // window.minimise();
      } else {
        if (frames.length > 0) {
          window.setFrame(frames.shift());
        } else {
          // window.minimise();
        }
      }
    }
  }
}

function save(number) {
  const layout = {};
  const screens = Screen.all();
  for (let screen of screens) {
    const layoutWindows = {};
    const windows = screen.windows();
    for (let window of windows) {
      const app = window.app();
      const appName = app.bundleIdentifier();
      const frame = window.frame(); 
      if (frame.width > 1 && frame.height > 1) {
        if (layoutWindows[appName] === undefined) {
          layoutWindows[appName] = [];
        }
        layoutWindows[appName].push(frame);
      }
    }
    layout[screen.identifier()] = layoutWindows;
  }
  Storage.set(`record_${number}`, layout);
  Phoenix.log(JSON.stringify(layout));
}

function load(number) {
  const layout = Storage.get(`record_${number}`);
  console.log(JSON.stringify(layout));
  if (layout === undefined) {
    return;
  }
  const workScreen = Window.focused().screen().identifier();
  console.log(workScreen);
  const layoutWindows = layout[workScreen];
  if (layoutWindows === undefined) {
    return;
  }

  const windowCount = getWindowCount(workScreen);
  let count = 0;
  
  for (let appName in layoutWindows) {
    const frames = layoutWindows[appName];
    const currentWindowCount = windowCount[appName] || 0;
    for (let i = 0; i < frames.length - currentWindowCount; i++) {
      count++;
      const args = ['-n', '-b', appName];
      if (appName == 'com.microsoft.VSCode') {
        args.push('--args');
        args.push('.');
      }
      const task = new Task('/usr/bin/open', args, (r) => {
        count--;
        if (count == 0) {
          Timer.after(1, () => {adjustWindow(layout);});
        }
      });
    }
  }
  
  if (count == 0) {
    adjustWindow(layout);
  }
}

// save
Key.on('1', ['ctrl', 'alt', 'shift'], () => {save('1');});
Key.on('2', ['ctrl', 'alt', 'shift'], () => {save('2');});
Key.on('3', ['ctrl', 'alt', 'shift'], () => {save('3');});
Key.on('4', ['ctrl', 'alt', 'shift'], () => {save('4');});
// load
Key.on('1', ['ctrl', 'alt'], () => {load('1')});
Key.on('2', ['ctrl', 'alt'], () => {load('2')});
Key.on('3', ['ctrl', 'alt'], () => {load('3')});
Key.on('4', ['ctrl', 'alt'], () => {load('4')});