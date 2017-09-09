console.log = function(...args){
  Phoenix.log(...args);
};

function listApps() {
  const apps = App.all();
  for (let app of apps) {
    console.log(app.bundleIdentifier());
  }
}

function getAppsFromScreens() {
  const apps = [];
  const screens = Screen.all();
  for (let screen of screens) {
    const layoutWindows = {};
    const windows = screen.windows();
    for (let window of windows) {
      const app = window.app();
      const appName = app.bundleIdentifier();
      const frame = window.frame(); 
      if (frame.width > 1 && frame.height > 1) {
        apps.push({
          app: app,
          window: window,
          name: appName,
          frame: frame,
        });
      }
    }
  }
  return apps;
}

const LaunchSettings = {
  'com.microsoft.VSCode': ['-n', '-b', 'com.microsoft.VSCode', '--args', '.'],
  'com.google.Chrome': ['-n', '-b', 'com.google.Chrome'],
  'com.apple.Terminal': ['-b', 'com.apple.Terminal', ""],
};

function save(number) {
  const apps = getAppsFromScreens();
  const saveApps = [];
  for (let app of apps) {
    saveApps.push({
      name: app.name,
      frame: app.frame,
    })
  }
  console.log(JSON.stringify(saveApps));
  Storage.set(`record_${number}`, saveApps);
}

function adjustWindow(apps) {
  const currentApps = getAppsFromScreens();
  for(let cApp of currentApps) {
    let removeIdx = -1;
    for (let i in apps) {
      const app = apps[i];
      if (cApp.name === app.name) {
        cApp.window.setFrame(app.frame);
        removeIdx = i;
      }
    }
    apps.splice(removeIdx, 1);
  }
}

function load(number) {
  const apps = Storage.get(`record_${number}`);
  if (apps === undefined) {
    return;
  }
  adjustWindow(apps);
  console.log(JSON.stringify(apps));
  // launch app
  let waitCount = 0;
  for (let app of apps) {
    waitCount++;
    let args = LaunchSettings[app.name];
    if (args === undefined) {
      args = ['-n', '-b', app.name];
    }
    const task = new Task('/usr/bin/open', args, (r) => {
      waitCount--;
      if (waitCount === 0) {
        Timer.after(1, () => {adjustWindow(Storage.get(`record_${number}`));});  
      }
    });
  }
}

// save
Key.on('1', ['ctrl', 'alt', 'shift'], () => {save('1');});
Key.on('2', ['ctrl', 'alt', 'shift'], () => {save('2');});
Key.on('3', ['ctrl', 'alt', 'shift'], () => {save('3');});
Key.on('4', ['ctrl', 'alt', 'shift'], () => {save('4');});
// // load
Key.on('1', ['ctrl', 'alt'], () => {load('1')});
Key.on('2', ['ctrl', 'alt'], () => {load('2')});
Key.on('3', ['ctrl', 'alt'], () => {load('3')});
Key.on('4', ['ctrl', 'alt'], () => {load('4')});