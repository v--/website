import vibe.d;
import database;
static import files;
static import forex;

interface IAPI {
	Json queryFiles();
	@path("/forex/:currency")
	Json getForex(string _currency);
	Json querySlides();
	Json queryPackages();
}

class API : IAPI
{
	Json queryFiles()
	{
		return files.get();
	}

	Json getForex(string currency)
	{
		return forex.get(currency);
	}

	Json querySlides()
	{
		return files.get("slides");
	}

	Json queryPackages()
	{
		return files.get("pacman");
	}
}
