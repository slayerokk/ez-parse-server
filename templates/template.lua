DATABASE = {
    <% _.forEach(sorted, function(account) { %>["<%- account.login %>"] = {<% _.forEach(account.persons, function(character) { %>{n="<%- character.name %>",l=<%- character.lvl %>,s=<%- character.gs %>,r=<%- character.race %>,g="<%- character.guild %>",c=<%- character.class %>},<% }); %>},
    <% }); %>
}
		
CLASSES = {
	[0] = "ffabd473", --Hunter (Охотник)-
	[1] = "ff8788ee", --Warlock (Чернокнижник)-
	[2] = "ffffffff", --Priest (Жрец)-
	[3] = "fff58cba", --Paladin (Паладин)-
	[4] = "ff3fc7eb", --Mage (Маг)-
	[5] = "fffff569", --Rogue (Разбойник)-
	[6] = "ffff7d0a", --Druid (Друид)-
	[7] = "ff0070de", --Shaman (Шаман)-
	[8] = "ffc79c6e", --Warrior (Воин)-
	[9] = "ffc41f3b", --Death knight (Рыцарь смерти)-
	[10] = "4ec0fffe", --captions
	[11] = "ffc41f3b", --horde
	[12] = "ff3fc7eb", --alliance
	[13] = "00ff96ff"  --guild
};

RACES = {
	[0] = "Человек",
	[1] = "Дворф",
	[2] = "Ночной эльф",
	[3] = "Гном",
	[4] = "Дреней",
	[5] = "Орк",
	[6] = "Нежить",
	[7] = "Таурен",
	[8] = "Тролль",
	[9] = "Кровавый эльф"
};

local function TEXT_COLOR(TEXT, INDEX)
	return ("|c%s%s|r"):format(CLASSES[INDEX], TEXT);
end

local function TEXT_RACE(INDEX)
    if INDEX>=5 then
		return TEXT_COLOR(RACES[INDEX], 11);
	else
		return TEXT_COLOR(RACES[INDEX], 12);
	end
end

local function TEXT_GUILD(CAPTION)
	if CAPTION == "" then
        return ""
    else
		return TEXT_COLOR("<"..CAPTION..">", 10)
	end
end

local function TEXT_ACCOUNT(CAPTION)
	return TEXT_COLOR("<"..CAPTION..">", 10)
end

local function TEXT_NAME(CAPTION, CLASS)
	return ("|Hplayer:%s|h%s|h"):format(CAPTION, TEXT_COLOR(CAPTION, CLASS));
end

local function TEXT_OUT(NAME, CLASS, LEVEL, RACE, GS, GUILD)
	print(TEXT_COLOR("["..LEVEL.."] ", 12)..TEXT_NAME(NAME, CLASS).." "..TEXT_COLOR(GS.." GS", 10).." "..TEXT_RACE(RACE).." "..TEXT_GUILD(GUILD));
end

local function PRINT_ARRAY(CHARACTERS, ACCOUNT)
    local COUNTER = 0;
    print(" ");
    print(TEXT_COLOR("Все персонажи аккаунта "..TEXT_COLOR(ACCOUNT, 3), 10));
    print(" ");
    for index, CHARACTER in ipairs(CHARACTERS) do
        TEXT_OUT(CHARACTER.n, CHARACTER.c, CHARACTER.l, CHARACTER.r, CHARACTER.s, CHARACTER.g);
        COUNTER = COUNTER +1;
    end
    print(" ");
    print(TEXT_COLOR("Найдено персонажей: "..TEXT_COLOR(COUNTER, 3), 10));
    print(" ");
end

SLASH_ARMORY1, SLASH_ARMORY2 = '/ar', '/armory';

SlashCmdList["ARMORY"] = function (MESSAGE)
    print(" ");
    print(TEXT_COLOR("EZWoW.org Оружейная 2.0, (с) Border", 10));
    print(TEXT_COLOR("База от <%- date %>", 10));
    print(TEXT_COLOR("Cодержит аккаунтов - "..TEXT_COLOR("<%- accounts %>", 3)..", персонажей - "..TEXT_COLOR("<%- characters %>", 3), 10));

    local CURRENT_ACCOUNT, CURRENT_CHARACTERS, ACCOUNT, CHARACTERS, TARGET = nil
	
    local PLAYER = UnitName("target");
	if (PLAYER ~= nil) then
		TARGET = PLAYER
	else
		TARGET = MESSAGE
	end
	
	if (TARGET == "") then
		return 0
	end

    for key, value in pairs(DATABASE) do
        CURRENT_ACCOUNT = key
        CURRENT_CHARACTERS = DATABASE[CURRENT_ACCOUNT]
        for key, value in pairs(CURRENT_CHARACTERS) do
            if (strlower(value.n) == strlower(TARGET)) then
                ACCOUNT = CURRENT_ACCOUNT
                CHARACTERS = CURRENT_CHARACTERS
                break
            end
        end
    end

    if ACCOUNT == nil then
        print(TEXT_COLOR("Ничего не найдено.", 10));
    else
        local SORTED = {};
        for key, value in pairs(CHARACTERS) do
            table.insert(SORTED, value);
        end
        sort(SORTED, function(a, b) return a.s>b.s end)
        PRINT_ARRAY(SORTED, ACCOUNT);
    end
end