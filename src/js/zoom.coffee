window.zoomTextOnlyLoaded = true
totalRatio = 1
ZOOM_LEVEL_KEY = 'zoomLevel'
IGNORED_TAGS = /SCRIPT|NOSCRIPT|LINK|BR|EMBED|IFRAME|IMG|VIDEO|CANVAS|STYLE/

$.extend $.gritter.options,
  position: "bottom-left" # defaults to 'top-right' but can be 'bottom-left', 'bottom-right', 'top-left', 'top-right' (added in 1.7.1)
  fade_in_speed: 0 # how fast notifications fade in (string or int)
  fade_out_speed: 0 # how fast the notices fade out
  time: 3000 # hang on the screen for...

multiplyByRatio = (value, multiplier) ->
  (parseFloat(value) * multiplier) + 'px'

addImportantStyle = (el, name, value) ->
  el.style.cssText += "#{name}: #{value} !important;"

changeFont = (ratioDiff, notification = true) ->
  #start = (new Date()).getTime() # uncomment to benchmark
  changeFontSizeCalls = []
  prevRatio           = totalRatio
  totalRatio          += ratioDiff
  totalRatio          = Math.round(totalRatio * 10) / 10
  multiplier          = totalRatio / prevRatio
  relevantElements    = $('body, body *')

  if notification
    $('.gritter-close').click()
    $.gritter.add
      title: "Text Zoom"
      text: "Level #{(totalRatio * 100).toFixed()}%"

  if totalRatio == 1
    relevantElements.css
      'font-size':   ''
      'line-height': ''
    relevantElements.removeClass 'noTransition'
    return util.putInLocalStorage(ZOOM_LEVEL_KEY, false)

  util.putInLocalStorage ZOOM_LEVEL_KEY, (totalRatio - 1)

  # transitions screw up font size measuring
  relevantElements.addClass('noTransition') if prevRatio == 1

  for element in relevantElements
    ((el) ->
      tagName = el.tagName
      return if tagName.match(IGNORED_TAGS)

      if !util.isBlank(el.innerText) || (tagName == 'TEXTAREA')
        currentLh  = getComputedStyle(el).lineHeight
        lineHeight = multiplyByRatio(currentLh, multiplier) if currentLh.indexOf('px') != -1

      fontSize = multiplyByRatio(getComputedStyle(el).fontSize, multiplier)

      changeFontSizeCalls.push ->
        addImportantStyle(el, 'font-size', fontSize)
        addImportantStyle(el, 'line-height', lineHeight) if lineHeight?
    )(element)

  for call in changeFontSizeCalls
    call()

  #console.log (new Date()).getTime() - start # uncomment to benchmark

getKeyFromBackground = (keyName, keyFunction) ->
  chrome.extension.sendMessage key: keyName, (res) ->
    Mousetrap.bind res.key, keyFunction

getKeyFromBackground util.KEYS.ZOOM_IN_KEY, ->
  changeFont 0.1

getKeyFromBackground util.KEYS.ZOOM_OUT_KEY, ->
  changeFont -0.1

getKeyFromBackground util.KEYS.ZOOM_RESET_KEY, ->
  totalRatio = 1
  changeFont 0

zoomLevel = util.getFromLocalStorage(ZOOM_LEVEL_KEY)
changeFont(zoomLevel, false) if zoomLevel
