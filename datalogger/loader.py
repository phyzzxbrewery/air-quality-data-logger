import yaml, json

def getConfigLoader(ext):
	if ext == '.yaml' or ext == '.yml':
		return yaml
	elif ext == '.json':
		return json
	else:
		raise NotImplementedError(f'There is no Loader implemented for extension "{ext}"')
