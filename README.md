# ghostreacter

みんな Slack でリアクションしてる。してへんのはワイだけ。。  
しかし毎度毎度リアクションつけるには人の一生は短すぎる。。。

slack channel で、みんなが reaction してたら自分も reaction します。  
やっつけで書いたので、いろいろ目をつむってください。

## usage

`npm i`して、`.env`を整備して`cdk deploy`すれば動きます。

### `.env`

#### SLACK_TOKEN

[Token の生成方法](https://qiita.com/taumu/items/59cf09fc06300946de8d)

Scope は`reactions:read`,`reactions:write`,`search:read`の 3 つを付けときます。

#### MY_MEMBER_ID

[メンバー ID の確認方法](https://scheduling.help.receptionist.jp/slack-id/#:~:text=%E3%81%AE%E7%A2%BA%E8%AA%8D%E6%96%B9%E6%B3%95-,%E5%B7%A6%E4%B8%8A%E3%81%AE%E3%83%81%E3%83%BC%E3%83%A0%E5%90%8D%E3%82%92%E3%82%AF%E3%83%AA%E3%83%83%E3%82%AF%E3%81%97%E3%81%A6%E3%80%81%E3%83%97%E3%83%AD%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%20%26%20%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88,%E3%81%99%E3%82%8B%E3%81%93%E3%81%A8%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%99%E3%80%82)

#### CHANNEL_NAME

ウォッチしたい channel

#### REACTION_NAME

みんなと同じように反応したい絵文字名
