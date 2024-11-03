# TRANSLATION

This submodule is responsible for managing translations in the HRM_FE project.

## Getting Started

To get started with the TRANSLATION submodule, follow these steps:

1.  Clone the HRM_FE repository.
2.  Navigate to the `translation` directory.
3.  Install the required dependencies by running `npm install`.
4.  Prepare the environment by creating a `.env` file with the following content:

    ```env
    SOURCE=vi
    TRANSLATION_FILES=en,lo
    I18N_FOLDER_PATH=../public/locales
    ```

    -   Replace the `SOURCE` value with the default language code.
    -   Replace the `TRANSLATION_FILES` value with a comma-separated list of language codes for the supported languages.
    -   Replace the `I18N_FOLDER_PATH` value with the path to the `public/locales` directory in the HRM_FE project.

5.  Start the development server by running `npm start`.

**Note**:

-   Only key with `_t_` prefix will be translated.
-   Others will be ignored if they existed in the `target` file.
-   Otherwise, they will be added to the `target` file with translated value.

## License

This submodule is licensed under the [MIT License](LICENSE).

## Contact

If you have any questions or suggestions regarding the TRANSLATION submodule, feel free to contact us at [yanmad27](mailto:yanmad27@gmail.com.com).
