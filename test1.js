'use strict'

const fs = require('fs');

var i = "ΣΦΨΞΔλΨΔΛΣΦΔλΨξΔϗΞΔΦΨΞϑλΨΛΣΘϑΞϗΦϑλΨΣΞΨλϑΞΨζβΣφΔΨΣΦΨΣΞΨξΛϗΞΞϑΨϖΣΞΨΠΣϖΛΣφΔΞΨΩΨΠΛΣΦϖϗϖϑΨΔΨΞΔΨΘΔφϗΔΨϖΣΨΞϑλΨΓΔΘϗΦϑλΨΣΞΨΔΛΛϗΣΛϑΨαΔΨΣΞΨΔΛΛϗΣΛϑΨαΔΨΣλΨξΔΦϖΣΛΔΨϖΣΨΦϗΣξΞΔΨλβΨΠϑΦΓΡϑΨΔΞΨαϗΣΦμϑΨΞϑΨλΔΞβϖΔΦΨΞΔλΨεΞΔβμΔλΨϖΣΞΨΠΔζϑΦΔΞΨΩΨΔΦϗΘΔΦϖϑΨΞΔΨμΛϑΠΔΨΠΔΛΨΣλϑλΨΓΣΛΛϑλΨΣΞΨΔΛΛϗΣΛϑΨαΔΨΣΞΨΔΛΛϗΣΛϑΨαΔΨΞΔλΨΠΣΦΔλΨΩΨΞΔλΨαΔηβϗμΔλΨλΣΨαΔΦΨΠΔΛΨΞΔΨΘϗλΘΔΨλΣΦϖΔΨΞΔλΨΠΣΦΔλΨλϑΦΨϖΣΨΦϑλϑμΛϑλΨΞΔλΨαΔηβϗμΔλΨλϑΦΨΔζΣΦΔλ";

// Metropolis criteria
function metropolis_criteria(delta, T) {
   if (delta <= 0) return true;
   if (Math.random() < Math.exp(-delta / T)) return true;
   return false;
}

//  State changes
function new_state(alpha) {
   var c = alpha.split("");
   var i = Math.floor(Math.random() * alpha.length),
      j = Math.floor(Math.random() * alpha.length);
   while (j == i) 
      j = Math.floor(Math.random() * alpha.length);
   if (Math.random() < 0.5) {
      let t = c[i];
      c[i] = c[j];
      c[j] = t;
   } else {
      if (i > j) {
         let t = i;
         i = j;
         j = t;
      }
      var m = c.slice(i, j);
      m.push(m.pop(0));
      for (let idx = i, k = 0; idx < j; idx++, k++) {
         c[idx] = m[k];
      }
   }
   return c.join("");
}

// Mono-alphabetical substitution
function s_substitution(alpha, str) {
   var r = '';
   for (var c = 0; c < str.length; c++) {
      if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(str[c])) {
         r += alpha[str[c].codePointAt(0) - 'A'.codePointAt(0)];
      }
      else
         r += str[c];
   }
   return r;
}

//Frequency dictionary cuadrigrama
function fc(file = 'brut4g_en.txt') {
   var frec_4gr = {},
      total = 0,
      _4gram = fs.readFileSync(file, 'utf8'),
      arr_4grm = _4gram.split("\n");
   for (let i = 0; i < arr_4grm.length; i++) {
      frec_4gr[arr_4grm[i].split(" ")[0]] = Number(arr_4grm[i].split(" ")[1]);
      total += Number(arr_4grm[i].split(" ")[1]);
   }

   for (const key in frec_4gr)
      if (frec_4gr.hasOwnProperty(key))
         frec_4gr[key] /= total;
   
   return frec_4gr;
}

//String shuffle
String.prototype.str_shuffle = function () {
   var str = this.split(""),
      str_len = str.length;

   for (var i = str_len - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = str[i];
      str[i] = str[j];
      str[j] = tmp;
   }
   return str.join("");
}

//Log score
function log_score(str) {
   var log_sum = 0,
      min_freq = 1e-100,
      frec_4gr = fc('brut4g_space_es.txt');
   for (let a = 0; a < str.length - 3; a++) {
      log_sum += Math.log10((frec_4gr.hasOwnProperty(str.slice(a, a + 4))) ? frec_4gr[str.slice(a, a + 4)] : min_freq);

   }
   return -log_sum;
}

function RS_sub(crypto, max_iter = 8000, CoolRatio = 0.8) {
   var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.str_shuffle(),
      old_score = log_score(s_substitution(alpha, crypto)),
      T = 0;
   for (let i = 0; i < 100; i++) {
      alpha = alpha.str_shuffle();
      var new_score = log_score(s_substitution(alpha, crypto));
      var delta = new_score - old_score;
      if (delta > T) T = delta;
      old_score = new_score;
   }
   T *= 10
   var best_alpha = alpha,
      best_score = old_score,
      freeze = 0;
   while (true) {
      var nb_iter = 0;
      while (nb_iter < max_iter) {
         var nalpha = new_state(alpha);
         new_score = log_score(s_substitution(nalpha, crypto));
         delta = new_score - old_score;
         if (metropolis_criteria(delta, T)) {
            alpha = nalpha;
            old_score = new_score;
            if (old_score < best_score) {
               best_score = old_score;
               best_alpha = alpha;
               console.log(best_score);
               console.log(s_substitution(best_alpha, crypto));
               console.log('------');
            }
            freeze = 0;
         } else {
            freeze += 1;
         }
         nb_iter += 1;
      }
      T *= CoolRatio;
      if (freeze > 25)
         break;
   }
   console.log("-------> Best solution <-------");
   console.log('score = ', best_score);
   console.log('Alphabet deciffrant :', best_alpha);
   console.log(s_substitution(best_alpha, crypto));
}

/******************************************************************/


function set(str) {
   let table = new Object();
   for (let index = 0; index < str.length; index++) 
      table[str[index]] = str[index];
   return table;
}

i = i.replace(" ", "")
console.log(i.length)

console.log(Object.keys(set(i)).length);

/**
 *   Transliteration
 */
var alpha26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
   t = '',
   alpha = new Object(),
   index = 0;

for (let idx = 0; idx < i.length; idx++) {
   let char = i[idx];
    if (!(char in alpha)) {
      alpha[char] = alpha26[index];
      index++;
   }
   t += alpha[char];
} 

console.log(t); 
console.log("************* START ************"); 
RS_sub(out)
/******************************************************************/

/**
 * With the quadigram in english
 * 
 *-------> Best solution <-------
 *score =  1967.516089451423
 *Alphabet deciffrant: ENSLATRFIOWBYVPMUKHGDCZQJX
 ENSLATSARENATSFAILANSLOTSREWOLINOTSELSTOLSBYEVASENSELSFRILLOSPELSMEPREVALSUSMRENPIPOSASLASWAVIASPESLOTSKAWINOTSELSARRIEROSHASELSARRIEROSHASETSFANPERASPESNIEFLASTYSMONKGOSALSHIENDOSLOSTALYPANSLATSCLAYDATSPELSMABONALSUSANIWANPOSLASDROMASMARSETOTSKERROTSELSARRIEROSHASELSARRIEROSHASLATSMENATSUSLATSHAZYIDATSTESHANSMARSLASWITWASTENPASLATSMENATSTONSPESNOTODROTSLATSHAZYIDATSTONSABENAT
 * 
 * 
 * 
 * 
 * Alphabet deciffrant :ENSLATRFIOWBYVPMUKHGDCZQJX
 * Normal alphabet:      ABCDEFGHIJKLMNOPQRSTUVWXYZ
 * console.log(i.remplace("C", "_"))
 */

//output after remplacing the character C for  _
var out = "AB_DEF_EGABEF_HEIDEB_DJF_GAKJDIBJF_AD_FJD_LMANE_AB_AD_HGIDDJ_OAD_PAOGANED_Q_PGABOIOJ_E_DE_KENIE_OA_DJF_REKIBJF_AD_EGGIAGJ_SE_AD_EGGIAGJ_SE_AF_HEBOAGE_OA_BIAHDE_FM_PJBRTJ_ED_SIABUJ_DJ_FEDMOEB_DEF_VDEMUEF_OAD_PELJBED_Q_EBIKEBOJ_DE_UGJPE_PEG_AFJF_RAGGJF_AD_EGGIAGJ_SE_AD_EGGIAGJ_SE_DEF_PABEF_Q_DEF_SEWMIUEF_FA_SEB_PEG_DE_KIFKE_FABOE_DEF_PABEF_FJB_OA_BJFJUGJF_DEF_SEWMIUEF_FJB_ELABEF"

//Loading the Spanish language inlucing the spaces ( _ ) and then solving on RS_sub(out)
/**
 * -------> Best solution <-------
 *score =  1396.2499159162442
 *Alphabet deciffrant : ENWLASRBIOMJUGDPYCVHTFQXZK
 *EN_LAS_ARENAS_BAILAN_LOS_REMOLINOS_EL_SOL_JUEGA_EN_EL_BRILLO_DEL_PEDREGAL_Y_PRENDIDO_A_LA_MAGIA_DE_LOS_CAMINOS_EL_ARRIERO_VA_EL_ARRIERO_VA_ES_BANDERA_DE_NIEBLA_SU_PONCHO_AL_VIENTO_LO_SALUDAN_LAS_FLAUTAS_DEL_PAJONAL_Y_ANIMANDO_LA_TROPA_PAR_ESOS_CERROS_EL_ARRIERO_VA_EL_ARRIERO_VA_LAS_PENAS_Y_LAS_VAQUITAS_SE_VAN_PAR_LA_MISMA_SENDA_LAS_PENAS_SON_DE_NOSOTROS_LAS_VAQUITAS_SON_AJENAS
 * 
 * It's a music theme from:
 * Divididos - El arriero
 */