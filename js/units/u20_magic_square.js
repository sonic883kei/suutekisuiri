/**
 * u20_magic_square.js  —  ⑳ 魔方陣
 * 3パターン（過去問の型）:
 *   Lv.1 3×3の魔方陣   … 連続する9個の整数（1〜9 に限らず a〜a+8）。図の2〜3マスが埋まっている → 空欄Xの値（2016 大阪府警察行政）
 *   Lv.2 4×4の魔方陣   … 1〜16。図のいくつかのマスが埋まっている → 空欄A・Bの和 A＋B（2013 特別区 身体障害者対象）
 *   Lv.3 魔辺三角形     … 三角形の頂点と辺の中点の6か所に連続する6整数 a〜a+5 → 各辺の和 X として「考えられないもの（考えられるもの）」（2014 大阪府行政・警察行政）
 * 出題の保証:
 *   Lv.1/2 は「和が等しいラインの未知数がちょうど1つ」という手順だけで求める値が決まる問題だけを出題（解説もその手順そのもの）。
 *          Lv.2 は 4×4 魔方陣 7040 通り（代表 880 個を8通りの回転・反転で展開）すべてと照合し、答えが一意であることも確認する。
 *   Lv.3 は 6! ＝ 720 通りの総当たりで、各選択肢が実現可能か不可能かを判定して正解を決める。
 * 図は q.figure（core.js の renderFigure が描画）で渡す。
 */
UnitRegistry.register({
    id: 'u20', name: '⑳ 魔方陣', chap: 2,
    generate(level) {
        const lv = [1, 2, 3].includes(parseInt(level)) ? parseInt(level) : getRandomInt(1, 3);
        return [msThree, msFour, msTriangle][lv - 1]();
    }
});

// 4×4 魔方陣(1〜16, 和34)の代表880個（8通りの回転・反転で同一視）。16文字の16進数で、各文字が「値−1」。
const MS_CANON4 = '01efbd24c6937a58 01efcd23b6947a58 01fecd32b6857a49 02df9c36e5a17b48 02dfbc34e781596a 02dfec3195a67b48 02dfec31b784596a 02fd7e18c5a3b946 02fdbe14c963758a 02fdce1375a8b946 02fdce13b964758a 03cf7d28e4b19a56 03cf7e18d4b2a965 03cfbd24e871569a 03cfbe14d87265a9 03cfde1274b8a965 03cfde12b87465a9 03cfed2174b89a56 03cfed21b874569a 03de8b56f4a17c29 03decf1274a9b865 03decf12b86574a9 03defa4185b67c29 03defc2165b89a47 03defc21a974568b 03ed8b65f4927c1a 03edcf21749ab856 03edcf21b856749a 03edf94286b57c1a 03edfc1256b8a947 03edfc129a74658b 03fcde21659ab847 03fcde21a956748b 03fced1256a9b847 03fced129a65748b 04bf9a56e3c17d28 04bfda52e781396c 04bfea5193c67d28 04bfea51d782396c 04fb7d2893c6ea15 04fb9d2673c8ea15 04fb9d26ea51738c 04fbed219a56738c 05af6e19d3c2b874 05af7b48e2d19c36 05af7e18b2d4c963 05afb964c2d37e18 05afbe1472d8c963 05afbe14d87263c9 05afc963b2d47e18 05afdb42e871369c 05afde1263c9b874 05afde12b87463c9 05afeb4172d89c36 05afeb41d872369c 05beaf1472c9d863 05beaf14d86372c9 05bec972f6813a4d 05bef861c7923a4d 05befa4163d89c27 05befa41c972368d 05ebaf41729cd836 05ebaf41d836729c 05ebfa1436d8c927 05ebfa149c72638d 05fabe41639cd827 05fabe41c936728d 05faeb1436c9d827 05faeb149c63728d 069f7b48d1e2ac35 069f7d28b1e4ca53 069fb874e3c15d2a 069fbd2471e8ca53 069fbd24e87153ca 069fd872e5a13b4c 069fdb4271e8ac35 069fdb42e87135ac 069fe871b3c45d2a 069fe871d5a23b4c 069feb41d87235ac 069fed21b87453ca 06bd9f2471cae853 06bd9f24e85371ca 06bdf94253e8ac17 06bdf942ca71358e 06db7c1a83e5f924 06db8e3571caf924 06db8e35f94271ac 06db9f4271ace835 06db9f42e83571ac 06dbac1753e8f924 06dbf92435e8ca17 06dbf924ac71538e 06f9ac35db42718e 06f9bd4253ace817 06f9bd42ca35718e 06f9db2435cae817 06f9db24ac53718e 06f9dc32ab45718e 078fdc3261e9ba54 079ead34f86152cb 079ebc2561f8da43 079ecb52f86134ad 079eda4361f8bc25 079efc2143dab865 07ad9e34f85261cb 07adbc1652f8e943 07adcb61f852349e 07ade94352f8bc16 07bc9e2561daf843 07bcad1652e9f843 07bcda61e952348f 07bce952da61348f 07cb9e52f83461ad 07cbad61f834529e 07cbda1634f8e925 07cbe92534f8da16 07cbfa1425e9d836 07da9e4361bcf825 07dabc61e934528f 07dacb1634e9f825 07dae934bc61528f 07e9ad4352bcf816 07e9bc52da34618f 07e9cb2534daf816 07e9da34bc52618f 087fde1263c9b5a4 08f7db4235ace619 08f7eb41369cd52a 096fb784e2d15c3a 096fbc34e78152da 096fbe1472d8c5a3 096fd782e4b13a5c 096fda52e78134bc 096fde1274b8a3c5 096fe781b2d45c3a 096fe781d4b23a5c 096fea51d78234bc 096fec31b78452da 097ef681a3d45c2b 097ef681c5b23a4d 097efc2143dab685 09e7bc5243adf618 09e7da3425cbf618 09e7f5284ad3b61c 09e7f6183ad4c52b 09e7f6185cb2a34d 09f6e7183ac5d42b 09f6e7185ca3b24d 0a5fb784d1e26c39 0a5fbd2471e8c693 0a5fbd24c69371e8 0a5fcd23b69471e8 0a5fd782b1e46c39 0a5fd782e4b1396c 0a5fdc3261e9b784 0a5fe781d4b2396c 0a5fed2174b893c6 0a7df58293e46c1b 0a7df582c6b1394e 0ad7f4386bc1952e 0ad7f52839e4c61b 0ad7f5286cb1934e 0af5d72839c6e41b 0af5d7286c93b14e 0b4fd872e5a1369c 0b4fe871d5a2369c 0b4fec3195a672d8 0b5ec792f4a1386d 0b5ec972f68134ad 0b5ed683a1f47c29 0b5ef861c79234ad 0b6dc7a1f492385e 0b6de58392f47c1a 0b7cd6a1e592384f 0b7ce592d6a1384f 0bc7d61a38f4e529 0bc7e52938f4d61a 0bc7e92516daf438 0bc7f61829e5d43a 0bc7f83416dae529 0bd6c71a38e5f429 0bd6e5387ca1924f 0be5c72938d6f41a 0be5d6387c92a14f 0be5d83627c9f41a 0c3fd782b1e46a59 0c3fdb4271e8a695 0c3fe781b2d4596a 0c3feb4172d895a6 0c7bf38495e26a1d 0c7bf384a6d1592e 0c7bfa1425e9d386 0cb7e92516daf348 0cb7f34859e2a61d 0cb7f3486ad1952e 0cb7f61829e5d34a 0d2fe871b3c4569a 0d2fea5193c674b8 0d3efa4185b672c9 0d6be38594f27a1c 0d6bf49283e57a1c 0d7ae394b6c1582f 0da7e34958f2b61c 0da7f4386bc1925e 0db6e3587ac1942f 0e3df94286b571ca 0e97f5284ad3b16c 10efdc23a7946b58 10feac35d7826b49 10fedc32a7856b49 12cf9a47e5b06d38 12cfde0365b8a974 12cfde03a97465b8 12cfeb5094a76d38 12cfed3074a98b56 12cfed30b865479a 12de6c39f5a08b47 12de6f09c5a3b874 12de7f08a4b5c963 12deac35f960478b 12deaf0574b8c963 12deaf05c96374b8 12decf0365a9b874 12decf03a96574b8 12defc3065a98b47 12defc30a965478b 12edcf30748ba956 12edcf30b847659a 12edfc0347b8a956 12edfc038b74659a 12fc9a74e5836d0b 12fcde30658ba947 12fcde30a947658b 12fce85397a46d0b 12fced0347a9b856 12fced038b65749a 13cedf20649ba875 13cedf20a85764b9 13cefd0246b9a875 13cefd028a7564b9 13ec4d2bf690a857 13ec8d27fa50649b 13ecfd20469ba857 13ecfd208a57649b 14afbe0563d8c972 14afbe05c97263d8 14afd863e7902b5c 14afe970d6832b5c 14afeb5072c98d36 14afeb50d863279c 14be6a59f3c08d27 14be6f09a3c5d872 14bea875d3c26f09 14beaf0563c9d872 14beaf05c96372d8 14beca53f960278d 14becf03a96572d8 14bed872a3c56f09 14bedf20a85763c9 14befa5063c98d27 14befa50c963278d 14befd028a7563c9 14ebaf50728dc936 14ebaf50d827639c 14ebfa0527d8c936 14ebfa058d72639c 14fa7b0c86d3e925 14fabe50638dc927 14fabe50c927638d 14facb0736d8e925 14fae92536d8cb07 14faeb0527c9d836 14faeb058d63729c 15ea6c3982d7fb04 15ea8c3762d9fb04 15ea8c37fb40629d 15eafc308b47629d 168fad3470e9cb52 168fbc25e97043da 168fcb5270e9ad34 168fda43e97025bc 168fed3052cba974 169e7b48a0f5cd23 169eab4570f8cd23 16ad7c0b83f4e952 16ad8f3470cbe952 16adbc0743f8e952 16adcb70f843259e 16adf843cb70259e 16bc8f25e94370da 16bcad0743e9f852 16bcda70e943258f 16bcf85243e9ad07 16cb7a0d85f2e934 16cb8f5270ade934 16cbad70f825439e 16cbda0725f8e934 16cbf825ad70439e 16da792c84f3eb05 16da8f43e92570bc 16dabc70e925438f 16dac92734f8eb05 16dacb0725e9f834 16daf83425e9cb07 16f8ad43cb25709e 16f8bc5243ade907 16f8cb25ad43709e 16f8da3425cbe907 178eac3560f9db42 178eac35f96042db 178eca5360f9bd24 178eca53f96024bd 178efa50c96324bd 178efc30a96542db 17ac8e3560dbf942 17ac8e35f94260db 17ac9f4260bde853 17ac9f42e83560db 17acdb0624f9e853 17ace85342f9bd06 17ace853db60249f 17ca8e5360bdf924 17ca8e53f92460bd 17cae83524f9db06 17cae835bd60429f 17e8ab45dc32609f 17e8ac5342bdf906 17e8ac53db24609f 17e8ca3524dbf906 17e8ca35bd42609f 17e8db42ac35609f 186fe790b2c54d3a 186fe790d4a32b5c 186fed3052cba794 187ea695f3c04d2b 187eaf0563c9d4b2 187ec693f5a02b4d 187ecf0365a9b2d4 187edf20649ba3c5 187ef690a3c54d2b 187ef690c5a32b4d 187efd0246b9a3c5 18e7f6092bd4c53a 18e7f6094db2a35c 18f6b70c4ad3e529 18f6c70b3ad4e529 18f6e4395bc2a70d 18f6e5293ad4c70b 18f6e7092bc5d43a 18f6e7094da3b25c 196eaf0574b8c2d3 19e6ca5324bdf708 19e6fa50278dc43b 1a4fc792b0e56d38 1a4fd683e5b0297c 1a4fd863e79025bc 1a4fe970d68325bc 1a6dbc0743f8e592 1a6dc7b0f483295e 1a6df483c7b0295e 1a7cd6b0e583294f 1a7cdb0624f9e583 1a7ce38594f26d0b 1a7cf49283e56d0b 1ac7b60d49f2e538 1ac7d60b29f4e538 1ac7f4296db0835e 1ad6b52c48f3e709 1ad6bc70438fe529 1ad6c52b38f4e709 1ad6c70b29e5f438 1ad6e3497cb0852f 1ad6e92507cbf438 1ad6f43829e5c70b 1ad6f83407cbe529 1af4c7296d83b05e 1af4d63829c7e50b 1b4ec693a0f57d28 1b4ec693f5a0287d 1b4edc32a78560f9 1b4ef690c5a3287d 1b4efc3065a982d7 1b6ce49382f57d0a 1b6ce493d7a0285f 1bc6e43928f5d70a 1bc6e4397da0825f 1be4c63928d7f50a 1be4c6397d82a05f 1c2feb5094a763d8 1c6bda0725f8e394 1c6bf285a7d0493e 1c7af29485e36b0d 1ca7d60b29f4e358 1ca7f2496bd0853e 1cb6f25849e3a70d 1d2ef690a3c5487b 1d2efa5063c984b7 1d6ae29584f37b0c 1d6ae295b7c0483f 1da6e25948f3b70c 1da6e2597bc0843f 1da6e3497cb0825f 1da6f83407cbe259 1e3cf5a082d7694b 1e3cf96042dba587 1e5af4b083c7692d 1e96f87025adc34b 20df7e18c5a39b64 20dfbe14c96357a8 20dfce1375a89b64 20dfce13b96457a8 20fdce31758a9b46 20fdce31b946578a 20fdec1357a89b46 20fdec139b64578a 21cfa947d6b05e38 21cfdb60a4975e38 21cfde30749a8b65 21cfde30b85647a9 21cfed0356b89a74 21cfed039a7456b8 21decf30748b9a65 21decf30b84756a9 21defc0347b89a65 21defc038b7456a9 21ed5c3af6908b47 21ed5f0ac693b874 21ed9c36fa50478b 21ed9f06ca5374b8 21edbf40c837569a 21edcf03569ab874 21edcf039a5674b8 21edfb048c73569a 21edfc30569a8b47 21edfc309a56478b 21fc6b58d4a39e07 21fc7e0985b6da43 21fc9e0765b8da43 21fca974d6835e0b 21fcd863a7945e0b 21fcda4365b89e07 21fcde03479ab865 21fcde038b5674a9 21fced30568b9a47 21fced309a47568b 23cd5f0ae87194b6 23cdef01587a94b6 23dcef10586b94a7 249fbd06ca7153e8 249fdb6071ca8e35 24bd596af3c08e17 24bd5a78e1c39f06 24bd5f0ae87193c6 24bd785ac3e19f06 24bd9f06ca5371e8 24bdcf039a5671e8 24bdef01587a93c6 24bdf96053ca8e17 24db9f60718eca35 24db9f60e81753ac 24dbf90617e8ca35 24dbf9068e7153ac 24f9bd60538eca17 24f9bd60ca17538e 24f9db0617cae835 24f9db068e5371ac 258fbc16da7043e9 258fcb6170da9e34 25bc7a4981f6de03 25bc8f16da4370e9 25bc9a4761f8de03 25bcf86143da9e07 25cb790e86f1da34 25cb8f61709eda34 25cb9e70f81643ad 25cbe90716f8da34 25cbf8169e7043ad 25e98f43da1670bc 25e9b70c48f3da16 25e9bc70da16438f 25e9c70b38f4da16 25e9cb0716daf834 25e9d61a38f4cb07 25e9f83416dacb07 25e9fa1407cbd836 25f89e43cb1670ad 25f8bc61439eda07 25f8cb169e4370ad 25f8e93416cbda07 269dbf4051aec873 269dbf40c83751ea 269dfb0415eac873 269dfb048c7351ea 26d98b47fc3051ae 26d9fb4015aec837 26d9fb408c3751ae 278d9c36fa5041eb 278dc96350fabe14 278dce31b94650fa 278dec139b6450fa 278dfc309a5641eb 279c8d36fa4150eb 279cd86341fabe05 27c98d6350befa14 27c98d63fa1450be 27c9d83614faeb05 27c9d836be5041af 27c9da1605ebf834 27c9f83405ebda16 27d89c6341befa05 27d89c63eb1450af 27d8c93614ebfa05 27d8c936be4150af 285fd7a0b1c64e39 287d95a6f3c04e1b 287d96b4e1c35f0a 287db496c3e15f0a 287dbf4051aec693 287dcf03569ab1e4 287df5a093c64e1b 287dfb0415eac693 28d7f50a1be4c639 28d7f50a4eb1936c 28f5970e6cb1d34a 28f5d34a6cb1970e 28f5d70a1bc6e439 28f5d70a4e93b16c 28f5e7091cb6d34a 294fc7a1b0d65e38 296dc387b4f05e1a 297cf4a183d65e0b 29c7b50e4af1d638 29c7e50b1af4d638 29c7f41a5eb0836d 29e5c70b1ad6f438 29e5f4381ad6c70b 29e5f6180bc7d43a 29f4c71a5e83b06d 29f4e5381ac7d60b 2ad5c96314bef708 2ad5f960178ec43b 2b4dc5a390f67e18 2b4dce31758a90f6 2b4de78150fa9c36 2b4dec1357a890f6 2b4dfc30569a81e7 2b5cd4a381f67e09 2bc5d43a18f6e709 2bc5d43a7e90816f 2bc5d61a09e7f438 2bc5f43809e7d61a 2bd4c53a18e7f609 2bd4c53a7e81906f 2c1fdb60a49753e8 2c3de78150fa9b46 2c5be90716f8d3a4 2c5bf18697e04a3d 2c79da1605ebf384 2c79f1a486d35b0e 2c97e50b1af4d368 2c97f14a5be0863d 2cb5d61a09e7f348 2cb5e34918f6d70a 2cb5f1684ad3970e 2d4be18796f05a3c 2d69f3c084b75a1e 2d69fa5014bec387 2d78e1b496c35a0f 2d87e14b5af0963c 2da5f870169ec34b 2db4e1785ac3960f 2e1df5a093c6487b 2e1df96053ca84b7 30cfde21659a8b74 30cfde21a95647b8 30cfed1256a98b74 30cfed129a6547b8 30deb856c7a14f29 30deca71b5864f29 30decf21658b9a74 30decf21a94756b8 30defc1247a98b65 30defc128b6547a9 30ed7a49c5b28f16 30edb865c7924f1a 30edc972b6854f1a 30edcb5274a98f16 30edcf12568ba974 30edcf129a4765b8 30edfc21479a8b56 30edfc218b56479a 30fc4d2be7819a56 30fc4e1bd782a965 30fc5b4ae6918d27 30fc8d27eb41569a 30fc8e17db4265a9 30fcae51d926478b 30fcde12478ba965 30fcde128b4765a9 30fcea159d62478b 30fceb41569a8d27 30fced21478b9a56 30fced218b47569a 31ce4d2bf6908a75 31ce8d27fa5046b9 31cefd20469b8a75 31cefd208a5746b9 31ec4f0bd872a695 31ec6f09da5284b7 31ecdf02487ba695 31ecdf026a5984b7 32cdfe01497a85b6 32dc4e1bf96085a7 32dc596ae4b18f07 32dc9f60e81745ab 32dce96154ba8f07 32dcf9068e7145ab 32dcfe10496b85a7 349ead07cb6152f8 349eda7061cb8f25 34ad9e07cb5261f8 34ade97052cb8f16 34bc6f09da5281e7 34bcdf026a5981e7 34da681f97e0cb25 34da6f81907ecb25 34da8f61e90752bc 34da970e68f1cb25 34da9e70618fcb25 34dae70918f6cb25 34dae9078f6152bc 34daf81607e9cb25 34e9582fa7d0cb16 34e98f52da0761bc 34e9ad70528fcb16 34e9da078f5261bc 34e9f82507dacb16 34f85e92a16dcb07 34f89e52cb0761ad 34f8a61d59e2cb07 34f8ad61cb07529e 34f8c70b29e5da16 34f8c92716daeb05 34f8d61a29e5cb07 34f8da1607cbe925 34f8e92507cbda16 358eac17db6042f9 358eca7160db9f24 358edb06ac7142f9 35ac8e17db4260f9 35ac9f60e81742db 35acde128b4760f9 35ace87142db9f06 35acf9068e7142db 35acfe10496b82d7 35ca8e71609fdb24 35ca8e71f90642bd 35cae81706f9db24 35cae8179f6042bd 35e8ac71429fdb06 35e8ac71db06429f 35e8ca1706dbf924 35e8ca179f4260bd 35e8db60249fca17 35e8db60ac17429f 35e8f94206bdca17 368d9c27eb5041fa 368dc97250ebaf14 369c8d27eb4150fa 369cd87241ebaf05 369cdf02487ba1e5 369ced218b4750fa 36c98d7250afeb14 36c98d72fa0541be 36c9d82705faeb14 36c9d827af5041be 36d89c7241afeb05 36d89c72eb0541af 36d8b50e4af1c927 36d8c92705ebfa14 36d8c927af4150be 36d8e50b1af4c927 378cae51d92640fb 378cea159d6240fb 37c89a56ed2140bf 37c8ea5104bfd926 37c8ea519d2640bf 385ea7c1d0b64f29 385ed6b0a1c74f29 386de5b092c74f1a 387c96d2e1a54f0b 387cd296a5e14f0b 38d6a41f5be0c729 38d6e50b4fa1927c 38d6f41a0be5c729 38e5942f6bd0c71a 38e5d60b4f92a17c 38e5f4290bd6c71a 38f4a70d5e92c16b 38f4c52b1ad6e709 38f4d61a0bc7e529 38f4d70a2e95c16b 38f4e5290bc7d61a 394ec6b1a0d75f28 396cd78240fbae15 396cde12478ba0f5 396ce4b182d75f0a 39c6e41b0af5d728 39c6e41b5fa0827d 39e4c25b7da0861f 39e4c61b0ad7f528 39e4c61b5f82a07d 39e4f6180da7c25b 3a4dc5b290e76f18 3a5cd4b281e76f09 3a5ce18796f04d2b 3a5ced21478b90f6 3a5cf69041eb8d27 3ac5d42b09f6e718 3ac5d42b6f90817e 3ad4c52b09e7f618 3ad4c52b6f81907e 3ad4e1695cb2870f 3b4cd5a260f98e17 3bc4d87205afe619 3bc4e871069fd52a 3c1ef5a082d74b69 3c1ef96042db87a5 3c5af09687e14b2d 3c69f0a587d24b1e 3c78e2d195a64b0f 3c78eb4105afd296 3c96f05a4be1872d 3ca5f0694bd2871e 3cb4da52078fe169 3cb4e961078fd25a 3d2ce18796f04a5b 3d2ceb41569a80f7 3d2cf69041eb8a57 3d4ae09786f15b2c 3d4ae70918f6c2b5 3d4af81607e9c2b5 3d68e0b597c24a1f 3d68e50b1af4c297 3d86e05b4af1972c 3d86f41a0be5c279 3da4e0795bc2861f 3da4f25809e7c61b 3e49f82507dac1b6 3e58f94206bdc1a7 3e85f4290bd6c17a 40fb9d62738cae15 40fbd92637c8ae15 41eb2c3df7809a56 41eb3a5cf6908d27 41eb3c78d296af05 41eb783c96d2af05 41eb7f80a25d9c36 41eb9f06ac3572d8 41ebaf059c3672d8 41ebf7082ad59c36 41ebfa50369c8d27 41ebfc30278d9a56 41fa3e0dc972b685 41fabe058d3672c9 41fade03297cb685 41faeb50368d9c27 42db396cf5a08e17 42db7f80916eac35 42db9f06ac3571e8 42dbaf059c3671e8 42dbf70819e6ac35 42dbf96035ac8e17 42f93d0eca71b586 42f9583ea7c1bd06 42f9ac71538ebd06 42f9bd068e3571ca 42f9db60358eac17 42f9e83517cabd06 42f9ed031a7cb586 43cb961e78f0ad25 43cba52d78f09e16 43da8f16bc2570e9 43daf86125bc9e07 43dafc21079eb865 43e98f25bc1670da 43e9f85216bcad07 43f89e25ad1670cb 43f8ad169e2570cb 43f8da61259ebc07 43f8e95216adbc07 45abf87023cd9e16 479acf12386db0e5 479af86103debc25 47a9cf21385eb0d6 48b7f30c1de2a659 48b7f30c2ed1956a 497ad68321fcbe05 497aed30168fb2c5 49a7d30e2cf1b658 49a7e30d1cf2b658 49a7f21c3ed0856b 4a5bfc30278d91e6 4a79e58312fcbd06 4a97d30e2cf1b568 4a97e30d1cf2b568 4a97f12c3de0865b 4b87d21e3cf0a569 4b87e12d3cf0965a 4c3bf70819e6a2d5 4c3bf7082ad591e6 4d2bfa50369c81e7 4d3ae97012cfb685 4e1bf87023cd95a6 4e1bf96035ac82d7 50ebaf149c2763d8 50ebfa41279c8d36 50fa2b4de7819c36 50fa6e91b34c8d27 50fa8e17bd2463c9 50fabe148d2763c9 50fae6193bc48d27 50faeb41278d9c36 51ea6f09bc3482d7 51eabf046c3982d7 52cb9e07ad3461f8 52cbe97034ad8f16 52da3cb4e1698f07 52da6f09bc3481e7 52dab43c69e18f07 52dabf046c3981e7 52e9384fc7b0ad16 52e98f34bc0761da 52e9bc078f3461da 52e9cb70348fad16 52e9f84307bcad16 52f89e34ad0761cb 52f8e94307adbc16 53ca8e17bd2460f9 53cabe148d2760f9 53cae87124bd9f06 53e8ac179f2460db 53e8ca71249fbd06 53e8fc120b6da497 56b8d30e2cf1a947 56b8de30294fa1c7 56b8e30d1cf2a947 58b6c21f3de0a749 58b6e30d2fc1947a 58b6f21c0de3a749 59a6e21d0cf3b748 59a6e21d3fc0847b 5a96c30f2de1b478 5a96f03c2de1874b 5b68d30e2cf1a497 5b68e30d1cf2a497 5b68f49203edac17 5b86c21f3de0a479 5b86e03d2cf1974a 5b86f21c0de3a479 5c3aeb41278d90f6 5d2ae6193bc480f7 5e29f84307bca1d6 60f95da2b34c8e17 60f9d52a3bc48e17 61e93cb4d25a8f07 61e9b43c5ad28f07 61f85e0bad3492c7 61f8be054d3a92c7 63d84f1abc2590e7 63d8af145c2b90e7 63d8fc210b5e94a7 64b9f30c1de28a57 65a9d21e3cf08b47 65b8ed301a4f92c7 6a59f30c1de284b7 6b49d21e3cf085a7 6b58f4a103de9c27 6d38e5b012cf9a47'.split(' ');
const MS_BASE3 = [2, 7, 6, 9, 5, 1, 4, 3, 8];   // 1〜9 の3×3魔方陣（他の7個は回転・反転）

function msSym(arr, n, k) {   // k=0..7: （転置するか）→ 90度回転を k&3 回
    const b = new Array(n * n);
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        let rr = r, cc = c;
        if (k & 4) [rr, cc] = [cc, rr];
        for (let i = 0; i < (k & 3); i++) [rr, cc] = [cc, n - 1 - rr];
        b[rr * n + cc] = arr[r * n + c];
    }
    return b;
}
let msAll4 = null;
function msMagic4All() {
    if (msAll4) return msAll4;
    const seen = new Set(); msAll4 = [];
    for (const h of MS_CANON4) {
        const base = h.split('').map(ch => parseInt(ch, 16) + 1);
        for (let k = 0; k < 8; k++) { const g = msSym(base, 4, k), key = g.join(','); if (!seen.has(key)) { seen.add(key); msAll4.push(g); } }
    }
    return msAll4;
}

const MS_NAMES3 = ['左上', '上', '右上', '左', '中央', '右', '左下', '下', '右下'];
function msCellName(n, i) { return n === 3 ? MS_NAMES3[i] : `${Math.floor(i / n) + 1}行${i % n + 1}列`; }
function msLines(n) {
    const L = [];
    for (let r = 0; r < n; r++) L.push({ name: `${r + 1}行目`, cells: [...Array(n).keys()].map(c => r * n + c) });
    for (let c = 0; c < n; c++) L.push({ name: `${c + 1}列目`, cells: [...Array(n).keys()].map(r => r * n + c) });
    L.push({ name: '左上から右下への対角線', cells: [...Array(n).keys()].map(i => i * n + i) });
    L.push({ name: '右上から左下への対角線', cells: [...Array(n).keys()].map(i => i * n + (n - 1 - i)) });
    return L;
}
// 「ラインの未知数がちょうど1つ」なら、そのマスは 和S − 他の既知の和 で決まる。これを繰り返して分かるマスを広げる。
function msPropagate(n, S, known0) {
    const known = known0.slice(), steps = [], lines = msLines(n);
    for (let changed = true; changed;) {
        changed = false;
        for (const L of lines) {
            const unk = L.cells.filter(i => known[i] === null);
            if (unk.length !== 1) continue;
            const used = L.cells.filter(i => known[i] !== null), v = S - used.reduce((s, i) => s + known[i], 0);
            known[unk[0]] = v; steps.push({ cell: unk[0], line: L, used, value: v }); changed = true;
        }
    }
    return { known, steps, lines };
}
// 求めたいマス(need)に必要な手順だけを取り出す（不要な手順は解説に出さない）
function msPrune(steps, needCells) {
    const need = new Set(needCells), keep = [];
    for (let i = steps.length - 1; i >= 0; i--) if (need.has(steps[i].cell)) { keep.unshift(steps[i]); steps[i].used.forEach(u => need.add(u)); }
    return { keep, need };
}
// ---- Lv.1 3×3の魔方陣（連続する9個の整数） ----
function msThree() {
    for (let t = 0; t < 20000; t++) {
        const a = getRandomInt(1, 20), m = a + 4, S = 3 * m, T = 9 * a + 36;
        const grid = msSym(MS_BASE3, 3, getRandomInt(0, 7)).map(v => v + a - 1);
        const cells = shuffleArray([0, 1, 2, 3, 5, 6, 7, 8]), X = cells[0], givens = cells.slice(1, 1 + (getRand() < 0.8 ? 2 : 3));
        const known = Array(9).fill(null); givens.forEach(i => known[i] = grid[i]); known[4] = m;
        const pr = msPropagate(3, S, known);
        if (pr.known[X] === null) continue;
        const { keep, need } = msPrune(pr.steps, [X]);
        if (keep.length < (getRand() < 0.7 ? 2 : 1)) continue;
        const centerUsed = need.has(4);
        const rows = [0, 1, 2].map(r => [0, 1, 2].map(c => { const i = r * 3 + c; return i === X ? 'X' : (givens.includes(i) ? grid[i] : ''); }));
        const steps = [
            `9個の数の和 ＝ (${a} + ${a + 8}) × 9 ÷ 2 ＝ ${T}。3つの行の和は等しいので、1ラインの和 S ＝ ${T} ÷ 3 ＝ ${S}`
        ];
        if (centerUsed) steps.push(`中央を通る4本のライン（中の行・中の列・2本の対角線）の和は 4 × ${S} ＝ ${4 * S}。これは全9マスの和 ${T} に、中央を3回余分に足したものなので、中央 ＝ (${4 * S} − ${T}) ÷ 3 ＝ ${m}（連続する9個の整数なら、真ん中の値が中央に入る）`);
        const nm3 = i => i === X ? `X（${msCellName(3, i)}）` : msCellName(3, i);
        keep.forEach(st => steps.push(`${st.line.name}：S − (${st.used.map(i => pr.known[i]).join(' + ')}) ＝ ${S} − ${st.used.reduce((s, i) => s + pr.known[i], 0)} ＝ ${st.value} → ${nm3(st.cell)} ＝ ${st.value}`));
        steps.push(`したがって X ＝ ${pr.known[X]}`);
        return {
            unit: '⑳ 魔方陣', title: '3×3の魔方陣',
            text: `${a}〜${a + 8} の連続する9個の整数を、3×3のマスに1つずつ入れて、縦・横・斜め（2本の対角線）のどの3つの数の和もすべて等しくなるようにします。図のように${givens.length}つの数が入っているとき、X に入る数を求めなさい。`,
            figure: { type: 'grid', rows },
            prompt: 'X に入る数はいくつですか。',
            correctAnswer: pr.known[X], unitSuffix: '', step: 1, consecutive: true, steps
        };
    }
    throw new Error('u20 Lv.1 の生成に失敗');
}

// ---- Lv.2 4×4の魔方陣（1〜16） → A＋B ----
function msFour() {
    const all = msMagic4All();
    for (let t = 0; t < 40000; t++) {
        const g = all[getRandomInt(0, all.length - 1)], cells = shuffleArray([...Array(16).keys()]);
        const A = cells[0], B = cells[1], givens = cells.slice(2, 2 + getRandomInt(6, 9));
        const known = Array(16).fill(null); givens.forEach(i => known[i] = g[i]);
        const pr = msPropagate(4, 34, known);
        let need, final = null;
        if (pr.known[A] !== null && pr.known[B] !== null) need = [A, B];
        else {
            const L = pr.lines.find(L => { const u = L.cells.filter(i => pr.known[i] === null); return u.length === 2 && u.includes(A) && u.includes(B); });
            if (!L) continue;
            final = { line: L, used: L.cells.filter(i => i !== A && i !== B) }; need = final.used;
        }
        const { keep } = msPrune(pr.steps, need);
        if (keep.length < (t < 8000 ? 2 : 0)) continue;
        const sum = g[A] + g[B];
        const cons = all.filter(h => givens.every(i => h[i] === g[i]));          // 4×4魔方陣7040通りすべてと照合
        if (cons.length === 0 || !cons.every(h => h[A] + h[B] === sum)) continue;
        const letters = { [A]: 'A', [B]: 'B' }, rows = [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => { const i = r * 4 + c; return i === A ? 'A' : i === B ? 'B' : (givens.includes(i) ? g[i] : ''); }));
        const nm = i => letters[i] ? `${letters[i]}（${msCellName(4, i)}）` : msCellName(4, i);
        const steps = [`1〜16 の和は (1 + 16) × 16 ÷ 2 ＝ 136。4つの行の和は等しいので、1ラインの和 S ＝ 136 ÷ 4 ＝ 34`];
        keep.forEach(st => steps.push(`${st.line.name}：S − (${st.used.map(i => pr.known[i]).join(' + ')}) ＝ 34 − ${st.used.reduce((s, i) => s + pr.known[i], 0)} ＝ ${st.value} → ${nm(st.cell)} ＝ ${st.value}`));
        if (final) steps.push(`${final.line.name}には A と B 以外の数が ${final.used.map(i => pr.known[i]).join('・')} と入っているので、A + B ＝ 34 − (${final.used.map(i => pr.known[i]).join(' + ')}) ＝ 34 − ${final.used.reduce((s, i) => s + pr.known[i], 0)} ＝ ${sum}`);
        else steps.push(`A ＝ ${pr.known[A]}、B ＝ ${pr.known[B]} なので、A + B ＝ ${sum}`);
        return {
            unit: '⑳ 魔方陣', title: '4×4の魔方陣',
            text: `1〜16 の整数を、4×4のマスに1つずつ入れて、縦・横・斜め（2本の対角線）のどの4つの数の和もすべて等しくなるようにします。図のようにいくつかの数が入っているとき、A と B に入る数の和 A + B を求めなさい。`,
            figure: { type: 'grid', rows },
            prompt: 'A + B はいくつですか。',
            correctAnswer: sum, unitSuffix: '', step: 1, consecutive: true, steps
        };
    }
    throw new Error('u20 Lv.2 の生成に失敗');
}

// ---- Lv.3 魔辺三角形 ----
// 並び p = [頂点0(上), 頂点1(左下), 頂点2(右下), 中点01(左辺), 中点12(底辺), 中点20(右辺)]
function msTriFeasible(a) {
    const vals = [0, 1, 2, 3, 4, 5].map(i => a + i), res = {};
    const rec = (p, used) => {
        if (p.length === 6) {
            const s1 = p[0] + p[3] + p[1], s2 = p[1] + p[4] + p[2], s3 = p[2] + p[5] + p[0];
            if (s1 === s2 && s2 === s3 && !res[s1]) res[s1] = p.slice();
            return;
        }
        for (let i = 0; i < 6; i++) if (!(used & (1 << i))) rec([...p, vals[i]], used | (1 << i));
    };
    rec([], 0);
    return res;   // { 一辺の和: 実現できる並びの例 }
}
function msTriangle() {
    const a = getRandomInt(1, 40), T = 6 * a + 15, feas = msTriFeasible(a), lab = ['①', '②', '③', '④', '⑤'];
    const vmin = 3 * a + 3, vmax = 3 * a + 12, lo = (T + vmin) / 3, hi = (T + vmax) / 3;     // 頂点の和の最小・最大から、一辺の和の範囲
    const askImpossible = getRand() < 0.6;
    const starts = askImpossible ? [lo - 1, lo] : [hi, lo - 4];    // 5つ並べた中で「不可能」が1つ（端）／「可能」が1つ（端）
    for (const st of shuffleArray(starts)) {
        const vs = [0, 1, 2, 3, 4].map(i => st + i), good = vs.filter(v => askImpossible ? !feas[v] : !!feas[v]);
        if (good.length !== 1 || st < 1) continue;
        const choices = vs.map((v, i) => ({ value: v, label: lab[i], htmlText: `${lab[i]} ${v}`, isCorrect: v === good[0] }));
        const ex = p => `頂点（上・左下・右下）が ${p[0]}・${p[1]}・${p[2]}、中点（左辺・底辺・右辺）が ${p[3]}・${p[4]}・${p[5]}`;
        const steps = [
            `6個の数の和 T ＝ ${a} + ${a + 1} + … + ${a + 5} ＝ ${T}`,
            `3辺の和を全部足すと 3X。頂点の数は2つの辺に含まれるので2回、中点の数は1回ずつ数えられ、3X ＝ T ＋ (頂点3つの和) となる。よって 頂点3つの和 ＝ 3X − ${T}`,
            `頂点3つの和は、最小で ${a} + ${a + 1} + ${a + 2} ＝ ${vmin}、最大で ${a + 3} + ${a + 4} + ${a + 5} ＝ ${vmax}。よって ${vmin} ≦ 3X − ${T} ≦ ${vmax} より ${lo} ≦ X ≦ ${hi}`,
            ...vs.map(v => feas[v]
                ? `X ＝ ${v}：頂点の和 ＝ 3 × ${v} − ${T} ＝ ${3 * v - T}（${vmin}〜${vmax}の範囲内）。実際に ${ex(feas[v])} と入れると各辺の和が ${v} になり、可能`
                : (3 * v < T ? `X ＝ ${v}：3 × ${v} ＝ ${3 * v} が T ＝ ${T} より小さく、頂点の和が正の数にならないので不可能`
                    : `X ＝ ${v}：頂点の和 ＝ 3 × ${v} − ${T} ＝ ${3 * v - T}（${vmin}〜${vmax}の範囲外）なので不可能`)),
            askImpossible ? `考えられないのは X ＝ ${good[0]}` : `考えられるのは X ＝ ${good[0]}`
        ];
        return {
            unit: '⑳ 魔方陣', title: '魔辺三角形',
            text: `図のような三角形の3つの頂点と3つの辺の中点（合計6か所の○）に、${a}〜${a + 5} の連続する6個の整数を1つずつ入れて、三角形の各辺（頂点2つとその間の中点の、3つの数）の和がすべて X になるようにします。`,
            figure: { type: 'tri', labels: [] },
            prompt: askImpossible ? 'X として考えられないものは、次のうちどれですか。' : 'X として考えられるものは、次のうちどれですか。',
            correctAnswer: good[0], customChoices: choices, steps
        };
    }
    throw new Error('u20 Lv.3 の生成に失敗');
}
