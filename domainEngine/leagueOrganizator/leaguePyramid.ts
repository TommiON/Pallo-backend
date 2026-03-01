// ylläpitää liigapyramidia, kauden vaihteessa pitää pystyä hetken ylläpitämään sekä vanhaa että uutta

// väliaikainen, haetaan DomainEnginen kellosta sitten kun toteutettu
const currentSeason = 1;

// aloitetaan ykkösdivisioonasta, rekuriivisesti alaspäin servicen findChildrenForLeague()-funktiolla
// mitä tämä palauttaisi? tuloksena linkitetty lista, pitäisikö tehdä oma eksplisiittinen tietorakenne?
// kuinka syvältä palautetaan? League-oliot kokonaan, mutta lisäksi Clubit johonkin syvyyteen? Niitähän pitää sitten siirrellä kauden päätteeksi.