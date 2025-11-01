export default {
  hu: {
    title: 'Film Preferenciák',
    subtitle: 'Állítsa be film preferenciáit a jobb ajánlásokért',
    loading: 'Preferenciák betöltése...',
    saving: 'Mentés...',

    tip: {
      title: 'Fontos tipp',
      description: 'Érdemes teljesíthető preferenciákat beállítani, különben fennállhat az, hogy megkérdőjelezhető filmeket fog ajánlani a rendszer.'
    },

    sections: {
      genres: {
        title: 'Műfaj Preferenciák',
        description: 'Válassza ki a kedvelt, nem kedvelt vagy semleges műfajokat.',
        like: 'Kedvelem',
        dislike: 'Nem kedvelem',
        neutral: 'Nincs véleményem'
      },
      year_range: {
        title: 'Megjelenési év tartomány',
        description: 'Válassza ki a preferált film korszakot.',
        from: 'Ettől',
        to: 'Eddig',
        presets: {
          all_time: 'Minden idő',
          modern: 'Modern (2000+)',
          recent: 'Új (2015+)',
          latest: 'Legújabb (2020+)',
          classics: 'Klasszikus (1970-1999)'
        }
      },
      rating: {
        title: 'Minimum értékelés',
        description: 'Csak legalább ennyi értékeléssel rendelkező filmeket mutasson (0-8.5).',
        any_rating: 'Bármilyen értékelés (0+)',
        excellent_only: 'Csak kiváló (8.5)'
      },
      runtime: {
        title: 'Futásidő preferencia',
        description: 'Milyen hosszú legyen a film?',
        options: {
          any: {
            label: 'Bármilyen hossz',
            description: 'Nincs preferencia'
          },
          short: {
            label: 'Rövid (kevesebb mint 90 perc)',
            description: 'Gyors nézés'
          },
          medium: {
            label: 'Közepes (90-150 perc)', 
            description: 'Standard hossz'
          },
          long: {
            label: 'Hosszú (több mint 150 perc)',
            description: 'Epikus filmek'
          }
        }
      }
    },

    actions: {
      save: 'Preferenciák mentése',
      reset: 'Alapértelmezett visszaállítása',
      reset_confirm: 'Biztosan visszaállítja az összes preferenciát alapértelmezettre?'
    },

    messages: {
      save_success: 'Preferenciák sikeresen mentve!',
      save_error: 'Hiba történt a mentés során',
      load_error: 'Hiba történt a preferenciák betöltése során',
      reset_success: 'Preferenciák visszaállítva alapértelmezettre',
      reset_error: 'Hiba történt a visszaállítás során'
    },

    genres: {
      action: 'Akció',
      adventure: 'Kaland',
      animation: 'Animáció',
      comedy: 'Vígjáték',
      crime: 'Krimi',
      documentary: 'Dokumentumfilm',
      drama: 'Dráma',
      family: 'Családi',
      fantasy: 'Fantasy',
      history: 'Történelmi',
      horror: 'Horror',
      music: 'Zenés',
      mystery: 'Rejtély',
      romance: 'Romantikus',
      science_fiction: 'Sci-Fi',
      thriller: 'Thriller',
      war: 'Háborús',
      western: 'Western',
      anime: 'Anime'
    }
  },

  en: {
    title: 'Movie Preferences',
    subtitle: 'Customize your movie recommendations',
    loading: 'Loading your preferences...',
    saving: 'Saving...',

    tip: {
      title: 'Important Tip',
      description: 'It is recommended to set achievable preferences, otherwise the system may recommend questionable movies.'
    },

    sections: {
      genres: {
        title: 'Genre Preferences',
        description: 'Choose which movie genres you love, dislike, or have not decided on yet.',
        like: 'Like',
        dislike: 'Dislike', 
        neutral: 'No preference'
      },
      year_range: {
        title: 'Release Year Range',
        description: 'Choose your preferred movie era.',
        from: 'From',
        to: 'To',
        presets: {
          all_time: 'All Time',
          modern: 'Modern (2000+)',
          recent: 'Recent (2015+)',
          latest: 'Latest (2020+)', 
          classics: 'Classics (1970-1999)'
        }
      },
      rating: {
        title: 'Minimum Rating',
        description: 'Only show movies with at least this rating (0-8.5).',
        any_rating: 'Any rating (0+)',
        excellent_only: 'Excellent only (8.5)'
      },
      runtime: {
        title: 'Runtime Preference',
        description: 'How long should your movies be?',
        options: {
          any: {
            label: 'Any Length',
            description: 'No preference'
          },
          short: {
            label: 'Short (less than 90 min)',
            description: 'Quick watch'
          },
          medium: {
            label: 'Medium (90-150 min)',
            description: 'Standard length'
          },
          long: {
            label: 'Long (more than 150 min)', 
            description: 'Epic movies'
          }
        }
      }
    },

    actions: {
      save: 'Save Preferences',
      reset: 'Reset to Defaults',
      reset_confirm: 'Are you sure you want to reset all preferences to defaults?'
    },

    messages: {
      save_success: 'Preferences saved successfully!',
      save_error: 'Failed to save preferences',
      load_error: 'Failed to load preferences',
      reset_success: 'Preferences reset to defaults',
      reset_error: 'Failed to reset preferences'
    },

    genres: {
      action: 'Action',
      adventure: 'Adventure',
      animation: 'Animation',
      comedy: 'Comedy',
      crime: 'Crime',
      documentary: 'Documentary',
      drama: 'Drama',
      family: 'Family',
      fantasy: 'Fantasy',
      history: 'History',
      horror: 'Horror',
      music: 'Music',
      mystery: 'Mystery',
      romance: 'Romance',
      science_fiction: 'Sci-Fi',
      thriller: 'Thriller',
      war: 'War',
      western: 'Western',
      anime: 'Anime'
    }
  }
}
