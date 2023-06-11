export async function getPageContent(url) {
  // Don't do this in production!
  const response = await fetch(url);
  const text = await response.text();

  return /<body[^>]*>([\w\W]*)<\/body>/.exec(text)[1];
}

function isBackNavigation(navigateEvent) {
  if (navigateEvent.navigationType === 'push' || navigateEvent.navigationType === 'replace') {
    return false;
  }

  if (
    navigateEvent.destination.index !== -1 &&
    navigateEvent.destination.index < navigation.currentEntry.index
  ) {
    return true;
  }

  return false;
}

// Intercept navigation
export async function onLinkNavigate(callback) {
  navigation.addEventListener('navigate', (event) => {
    const toUrl = new URL(event.destination.url);

    if (location.origin !== toUrl.origin) return;

    const fromPath = location.pathname;
    const isBack = isBackNavigation(event);

    event.intercept({
      async handler() {
        if (event.info === 'ignore') return;

        await callback({
          toPath: toUrl.pathname,
          fromPath,
          isBack,
        })
      }
    })
  })
}