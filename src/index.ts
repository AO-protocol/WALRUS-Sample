/**
 * WALRUSサンプルアプリケーション
 *
 * このファイルはTypeScriptの開発環境のセットアップを確認するためのサンプルファイルです。
 */

const greeting = (name: string): string => {
  return `こんにちは、${name}さん！`;
};

const main = (): void => {
  const message = greeting('WALRUS');
  console.log(message);
  console.log('TypeScript開発環境が正常にセットアップされました！');
};

main();
