# UPD: suspended due to breaking changes in idea.

# OXO Games

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

#### Show message:
```
showTopBannerMessage(textBefore, hash)
```

#### Hide message:
```
hideTopBannerMessage()
```

#### Add block loader:
```
window.CommonManager.showSpinner(_spinnerViewType)
```

#### Hide block loader:
```
window.CommonManager.hideSpinner(_spinnerViewType)
```

#### Show back timer (seconds, callback):
window.CommonManager.showBackTimer(10, function(){
   console.log('Inner callback function')
})
