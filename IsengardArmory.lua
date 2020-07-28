EZ_DATABASE = {


}

EZ_DATABASE2 = {
{a="Nayha",n="Найтария",l=80,s=6374,r=4,g="Лесбиянка",c=0},

}

SLASH_EZARMORY1, SLASH_EZARMORY2 = '/ar', '/armory';

EZ_BLACKING = 0;
EZ_FRIENDING = 0;
EZ_INVITING = 0;
EZ_RECRUITING = 0;

EZ_COLORS = {
  [0] = "ffabd473", --Hunter (Охотник)-
  [1] = "ff8788ee", --Warlock (Колдун)-
  [2] = "ffffffff", --Priest (Жрец)-
  [3] = "fff58cba", --Paladin (Паладин)-
  [4] = "ff3fc7eb", --Mage (Маг)-
  [5] = "fffff569", --Rogue (Вор)-
  [6] = "ffff7d0a", --Druid (Друид)-
  [7] = "ff0070de", --Shaman (Шаман)-
  [8] = "ffc79c6e", --Warrior (Воин)-
  [9] = "ffc41f3b", --Death knight (Рыцарь смерти)-
  
  [10] = "4ec0fffe", --captions
  [11] = "ffc41f3b", --horde
  [12] = "ff3fc7eb", --alliance
  [13] = "00ff96ff"  --guild
};

EZ_RACES = {
  [0] = "Человек",
  [1] = "Дворф",
  [2] = "НайтЭльф",
  [3] = "Гномик",
  [4] = "Дреней", 
  [5] = "Орк", 
  [6] = "Нежить",
  [7] = "Таурен",
  [8] = "Тролль",
  [9] = "Блудэльф",
};

EZ_SORTED = {};

local function tablelength(T)
  local count = 0
  for i,v in ipairs(T) do count = count + 1 end
  return count
end

local EZ_COUNT = tablelength(EZ_DATABASE)+tablelength(EZ_DATABASE2);

local function EZWrapColor(text, index)
	return ("|c%s%s|r"):format(EZ_COLORS[index], text);
end

local function EZWrapRace(character, raceindex)
if raceindex>=5 then
	return EZWrapColor(EZ_RACES[raceindex], 11);
else
	return EZWrapColor(EZ_RACES[raceindex], 12);
end
end

local function EZWrapGuild(guild)
	if guild == "" then return "" else
	return EZWrapColor("<"..guild..">", 10)
	end
end

local function EZWrapAccount(accname)
	return EZWrapColor("<"..accname..">", 10)
end

local function EZWrapNameHyperlink(text, index)
	return ("|Hplayer:%s|h%s|h"):format(text, EZWrapColor(text, index));
end

local function EZWrapBlackHyperlink(accname)
	return EZWrapColor(("|Hplayer:%s|h%s|h"):format(accname, "[Всех в ЧС]"), 11);
end

local function EZWrapFriendHyperlink(accname)
	return EZWrapColor(("|Hplayer:%s|h%s|h"):format(accname, "[Всех в ДР]"), 12);
end

local function EZWrapRecruitHyperlink(accname)
	return EZWrapColor(("|Hplayer:%s|h%s|h"):format(accname, "[Всех в ГИ]"), 13);
end

local function EZWrapInviteHyperlink(accname)
	return EZWrapColor(("|Hplayer:%s|h%s|h"):format(accname, "[Всех в РЕ]"), 12);
end

local function EZOutput(character, classindex, lvl, raceindex, score, guild)
	print(EZWrapColor("["..lvl.."] ", 12)..EZWrapNameHyperlink(character, classindex).." "..EZWrapColor(score.." GS", 10).." "..EZWrapRace(character, raceindex).." "..EZWrapGuild(guild));
end

local function EZOutputGi(character, classindex, lvl, raceindex, score, accname)
	print(EZWrapColor("["..lvl.."] ", 12)..EZWrapNameHyperlink(character, classindex).." "..EZWrapColor(score.." GS", 10).." "..EZWrapRace(character, raceindex).." "..EZWrapAccount(accname));
end

local function EZOutputArray(characters, foundedacc)
local counter = 0;
print(" ");
print(EZWrapColor("Все персонажи аккаунта "..EZWrapColor(foundedacc, 3), 10));
print(" ");
for i, v in ipairs(characters) do
	EZOutput(v.n, v.c, v.l, v.r, v.s, v.g);
	counter = counter +1;
end
print(" ");
print(EZWrapColor("Найдено "..EZWrapColor(counter, 3).." персонажей ", 10));
print(EZWrapBlackHyperlink(foundedacc).." "..EZWrapFriendHyperlink(foundedacc).." "..EZWrapRecruitHyperlink(foundedacc).." "..EZWrapInviteHyperlink(foundedacc));
print(" ");
print(" ");
print(" ");
end

local function EZOutputArrayGi(characters, foundedgi)
local counter = 0;
print(" ");
print(EZWrapColor("Все персонажи гильдии <"..EZWrapColor(foundedgi, 3)..">", 10));
print(" ");
for i, v in ipairs(characters) do
	EZOutputGi(v.n, v.c, v.l, v.r, v.s, v.a);
	counter = counter +1;
end
print(" ");
print(EZWrapColor("В гильдии "..EZWrapColor(counter, 3).." персонажей ", 10));
print(EZWrapBlackHyperlink(foundedgi).." "..EZWrapFriendHyperlink(foundedgi)..EZWrapInviteHyperlink(foundedgi));
print(" ");
print(" ");
print(" ");
end

local function handler(msg, editbox)

EZ_BLACKING = 0;
EZ_FRIENDING = 0;
EZ_RECRUITING = 0;
EZ_INVITING = 0;

local foundedacc = nil;
local foundedgi = nil;

print(" ");
print(" ");
print(" ");
print(EZWrapColor("EZWoW.org Оружейная 1.6, (с) Border <Fiasko>", 10));
print(EZWrapColor("База от 2 февраля 2018, содержит "..EZWrapColor(EZ_COUNT, 3).." персонажей.", 10));

for i, v in ipairs(EZ_DATABASE) do
    if (strlower(v.n) == strlower(msg)) then
		foundedacc = v.a;
		break;
    end
end

if foundedacc == nil then
	for i, v in ipairs(EZ_DATABASE2) do
		if (strlower(v.n) == strlower(msg)) then
			foundedacc = v.a;
			break;
		end
	end
end

--if foundedacc == nil then
	--for i, v in ipairs(EZ_DATABASE) do
		--if (strlower(v.g) == strlower(msg)) then
			--foundedgi = v.g;
			--break;
		--end
	--end
--end

--if foundedacc == nil and foundedgi == nil then
	--for i, v in ipairs(EZ_DATABASE2) do
		--if (strlower(v.g) == strlower(msg)) then
			--foundedgi = v.g;
			--break;
		--end
	--end
--end

--if foundedacc == nil and foundedgi == nil then
if foundedacc == nil then
	print(EZWrapColor("Ничего не найдено =(.", 10));
end

if foundedgi ~= nil then
	EZ_SORTED = {};
	local counter = 0;
	for i, v in ipairs(EZ_DATABASE) do
		if v.g == foundedgi then
			table.insert(EZ_SORTED, v);
		end
		counter = counter + 1;
	end
	for i, v in ipairs(EZ_DATABASE2) do
		if v.a == foundedgi then
			table.insert(EZ_SORTED, v);
		end
		counter = counter + 1;
	end
	sort(EZ_SORTED, function(a, b) return a.s>b.s end)
	EZOutputArrayGi(EZ_SORTED, foundedgi);
end

if foundedacc ~= nil then
	EZ_SORTED = {};
	local counter = 0;
	for i, v in ipairs(EZ_DATABASE) do
		if v.a == foundedacc then
			table.insert(EZ_SORTED, v);
		end
		counter = counter + 1;
	end
	for i, v in ipairs(EZ_DATABASE2) do
		if v.a == foundedacc then
			table.insert(EZ_SORTED, v);
		end
		counter = counter + 1;
	end
	sort(EZ_SORTED, function(a, b) return a.s>b.s end)
	EZOutputArray(EZ_SORTED, foundedacc);
end

end

SlashCmdList["EZARMORY"] = handler;

local f = CreateFrame("Frame");
function f:onUpdate(sinceLastUpdate)
	self.sinceLastUpdate = (self.sinceLastUpdate or 0) + sinceLastUpdate;
	if ( self.sinceLastUpdate >= 1 ) then 
		if tablelength(EZ_SORTED) == 0 then
			EZ_BLACKING = 0;
			EZ_FRIENDING = 0;
			EZ_RECRUITING = 0;
			EZ_INVITING = 0;
			f:SetScript("OnUpdate", nil)
		end
		for i,v in ipairs(EZ_SORTED) do
			if EZ_BLACKING == 1 then
				AddIgnore(v.n);
			end
			if EZ_FRIENDING == 1 then
				AddFriend(v.n);
			end
			if EZ_RECRUITING == 1 then
				GuildInvite(v.n);
			end
			if EZ_INVITING == 1 then
				InviteUnit(v.n);
			end
			table.remove(EZ_SORTED, i)
			break;
		end
		self.sinceLastUpdate = 0;
	end
end

local OldSetItemRef = SetItemRef 

function SetItemRef(link, text, button) 
	local blackposition = strfind(text, "ЧС");
	local friendposition = strfind(text, "ДР");
	local giposition = strfind(text, "ГИ");
	local reposition = strfind(text, "РЕ");
	if blackposition ~= nil then
		EZ_BLACKING = 1;
		f:SetScript("OnUpdate",f.onUpdate)
	elseif friendposition ~= nil then 
		EZ_FRIENDING = 1;
		f:SetScript("OnUpdate",f.onUpdate)
	elseif giposition ~= nil then 
		EZ_RECRUITING = 1;
		f:SetScript("OnUpdate",f.onUpdate)
	elseif reposition ~= nil then 
		EZ_INVITING = 1;
		f:SetScript("OnUpdate",f.onUpdate)
	else
		OldSetItemRef(link, text, button) 
	end 
end 