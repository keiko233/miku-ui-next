"use server";

import { CHANNEL_ID } from "@/consts";
import { parsePostContent } from "@/lib/ai";
import { getChannelLastPostId } from "@/lib/telegram";

const TEST_CONTENT =
  `Xiaomi 6 (Sagit) <br/><br/>Miku UI Vampire v0.6.1<br/><br/>Status: COMMUNITY<br/>Maintainer: <a href="https://t.me/Nanhumly" ` +
  `target="_blank">@Nanhumly</a> <br/>Android: 15 (V)<br/>SELinux:Enforcing  <br/>KernelSU (rsuntk-fork): 12066 (<a href="https:` +
  `//github.com/rsuntk/KernelSU/releases" target="_blank" rel="noopener" onclick="return confirm('Open this link?\n\n'+this.href` +
  `);">Manager Download</a>)<br/>Updated: 2025.02.13<br/> <br/><i class="emoji" style="background-image:url('//telegram.org/img/` +
  `emoji/40/E296AA.png')"><b>▪️</b></i> <a href="https://sourceforge.net/projects/divarelease/files/sagit_Vampire_v0.6.1/" target` +
  `="_blank" rel="noopener" onclick="return confirm('Open this link?\n\n'+this.href);">Download</a><br/> <br/>Changelog:  <br/>-` +
  `   Android 15 QPR1 update&#33; <br/>-   Update Android version to android-15.0.0_r14  <br/>-   Update Android Security Patch ` +
  `to 2025-02-05<br/>-   Settings UI update.<br/>-   Drop screenshot category feature<br/>-   Built-in Miku UI Music Center<br/>` +
  `-   Migrate to KernelSU (rsuntk-fork) (You will need to download a <a href="https://github.com/rsuntk/KernelSU/releases/tag/v` +
  `1.0.3-10-legacy" target="_blank" rel="noopener" onclick="return confirm('Open this link?\n\n'+this.href);"><u>new manager apk` +
  `</u></a>)<br/>-   More..    <br/>     <br/><a href="?q=%23MikuUI">#MikuUI</a> <a href="?q=%23Community">#Community</a> <a hre` +
  `f="?q=%23V">#V</a> <a href="?q=%23ROM">#ROM</a> <a href="?q=%23sagit">#sagit</a>`;

export const getLastPostId = async () => {
  try {
    return await getChannelLastPostId(CHANNEL_ID);
  } catch (error) {
    console.error(error);

    return null;
  }
};

export const parseTestContent = async () => {
  return await parsePostContent(TEST_CONTENT);
};
