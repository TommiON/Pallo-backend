/* ylläpitää liigapyramidia, kauden vaihteessa pitää pystyä hetken ylläpitämään sekä vanhaa että uutta
    - luodaan kauden välissä kokonaan uudelleen, mahdollisuus reagoida parametrien muutoksiin
    - ei suoraa linkitystä liigojen välillä, eli nousija/laskija ei tiedä tulevaa liigaansa -> helpottanee implementointia
    
*/


// väliaikainen, haetaan DomainEnginen kellosta sitten kun toteutettu
const currentSeason = 1;

// aloitetaan ykkösdivisioonasta, rekuriivisesti alaspäin servicen findChildrenForLeague()-funktiolla
// mitä tämä palauttaisi? tuloksena linkitetty lista, pitäisikö tehdä oma eksplisiittinen tietorakenne?
// kuinka syvältä palautetaan? League-oliot kokonaan, mutta lisäksi Clubit johonkin syvyyteen? Niitähän pitää sitten siirrellä kauden päätteeksi.