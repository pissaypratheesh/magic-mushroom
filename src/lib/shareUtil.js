/**
 * Created by sharadkumar on 13/7/17.
 */
module.exports = {
  whatsapp:whatsApp,
  facebook:facebook,
  twitter:twitter,
  email:email,
  googlePlus:googlePlus,
};

function objectToGetParams(object) {
  return '?' + Object.keys(object)
      .filter(key => !!object[key])
      .map(key => `${key}=${encodeURIComponent(object[key])}`)
      .join('&');
}

function whatsApp(object) {
  if(!object){
    return "";
  }
  return 'https://api.whatsapp.com/send'+objectToGetParams(object);
}

function facebook(obj) {
  if(!obj){
    return "";
  }
  return 'https://www.facebook.com/sharer/sharer.php' + objectToGetParams({
      u: obj.u,
      title:obj.title,
      description:obj.description,
      picture:obj.picture,
      //hashtag:obj.hashtag,
    });
}

function twitter(obj) {
    if(!obj){
      return "";
    }
    return 'https://twitter.com/share' + objectToGetParams({
      url:obj.url,
      text: obj.text,
      via:obj.via,
      //hashtags: obj.hashtags.join(','),
    });
}

 function email(obj) {

  return 'mailto:' + objectToGetParams({subject:obj.subject, body:obj.body });
 }

 function googlePlus(obj) {
   return 'https://plus.google.com/share' + objectToGetParams({ url:obj.url });
 }

// function linkedin(obj) {
//   return 'https://linkedin.com/shareArticle' + objectToGetParams({
//       url:obj.url,
//       title:obj.title,
//       summary: obj.description,
//     });
// }
//
// function pinterest(obj) {
//   return 'https://pinterest.com/pin/create/button/' + objectToGetParams({
//       url:obj.url,
//       media:obj.media,
//       description:obj.description,
//     });
// }
//
// function reddit(obj) {
//   return 'https://www.reddit.com/submit' + objectToGetParams({
//       url:obj.url,
//       title:obj.url,
//     });
// }


//Whats App {text: "GitHub:: http://github.com"}
// FB  {u: "http://github.com", title: "GitHub", description: undefined, picture: "http://localhost:8080/demo0///da3d8140e097582c686c2b72bd80d582.png", hashtag: undefined}
// twitter  {url: "http://github.com", text: "GitHub", via: undefined, hashtags: ""}
