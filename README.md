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

### Development:
Show top banner message (code inside one of the method):
```
this.$store.commit('showTopBannerMessage', {
  textBefore: 'before',
  hash: 'hash'
});
```

Hide top banner message:
```
this.$store.commit('hideTopBannerMessage')
```
