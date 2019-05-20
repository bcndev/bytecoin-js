
bcn_check_address_light = function(addr){
	var regalphabet = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
	if (!addr.match(regalphabet))
		return false;		
	if (addr.indexOf("2") == 0 && addr.length == 95)
		return true; // legacy
	if (addr.indexOf("bcnZ") == 0 && addr.length == 98)
		return true; // amethyst
	return false;
}
