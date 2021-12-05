DROP TABLE IF EXISTS `characters`;

CREATE TABLE `characters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `race` int(11) DEFAULT NULL,
  `class` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `guild` varchar(50) DEFAULT NULL,
  `login` varchar(50) DEFAULT NULL,
  `lvl` int(11) DEFAULT NULL,
  `kills` int(11) DEFAULT NULL,
  `gs` int(11) DEFAULT NULL,
  `ap` int(11) DEFAULT NULL,
  `updated` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chars_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

<% _.forEach(characters, function(character) { %>INSERT INTO `characters` VALUES (null,<%- character.race %>,<%- character.class %>,'<%- character.name %>','<%- character.guild %>','<%- character.login %>',<%- character.lvl %>,<%- character.kills %>,<%- character.gs %>,<%- character.ap %>,<%- character.updated %>);
<% }); %>